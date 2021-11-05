package route

import (
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"

	"github.com/julienschmidt/httprouter"

	"github.com/gobwas/ws"
	"github.com/gobwas/ws/wsutil"
)

type Subscription struct {
	clients []*Client
}

type Client struct {
	Name string
	Conn *net.Conn
}

type Event struct {
	Event string      `json:"event"`
	Data  interface{} `json:"data"`
}

func (s *Subscription) Broadcast(c *Client, event string, data interface{}) {
	e, err := json.Marshal(Event{event, data})
	if err != nil {
		log.Fatal("Error marshaling json")
	}

	wsutil.WriteServerText(*c.Conn, e)
}

func (s *Subscription) BroadcastAll(event string, data interface{}) {
	for _, client := range s.clients {
		go s.Broadcast(client, event, data)
	}
}

func (s *Subscription) BroadcastFromClient(c *Client, event string, data interface{}) {
	for _, client := range s.clients {
		if client.Name == c.Name {
			continue
		}

		go s.Broadcast(client, event, data)
	}
}

func (s *Subscription) Leave(c *Client) {
	for i, client := range s.clients {
		if c.Name == client.Name {
			log.Printf("%s has left the session !\n", c.Name)
			(*client.Conn).Close()
			s.clients[i] = s.clients[len(s.clients)-1]
			s.clients = s.clients[:len(s.clients)-1]
			break
		}
	}
}

func (s *Subscription) Join(name string, w http.ResponseWriter, r *http.Request) (*Client, error) {
	for _, client := range s.clients {
		if name == client.Name {
			log.Printf("User with name `%s` has already connected", name)
			return nil, fmt.Errorf("User with name `%s` has already connected", name)
		}
	}

	conn, _, _, err := ws.UpgradeHTTP(r, w)
	if err != nil {
		log.Fatal(err)
	}

	client := &Client{
		Name: name,
		Conn: &conn,
	}
	s.clients = append(s.clients, client)

	log.Printf("%s has connected !\n", name)

	return client, nil
}

func writeError(error string, w http.ResponseWriter) {
	b, _ := json.Marshal(Event{"ERROR", error})
	w.Header().Add("Content-Type", "application/json")
	w.Write(b)
}

func InitializedWS(s *Subscription) httprouter.Handle {
	return func(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
		q := r.URL.Query()
		if !q.Has("name") {
			writeError("Name is missing from query parameters", w)
			return
		}
		name := q.Get("name")

		client, err := s.Join(name, w, r)
		if err != nil {
			writeError(err.Error(), w)
			return
		}

		createHandler(client, s, w, r)(w, r)
	}
}

func createHandler(c *Client, s *Subscription, w http.ResponseWriter, r *http.Request) http.HandlerFunc {
	f := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		go func() {
			defer s.Leave(c)

			r := wsutil.NewReader(*c.Conn, ws.StateServerSide)
			w := wsutil.NewWriter(*c.Conn, ws.StateServerSide, ws.OpText)
			decoder := json.NewDecoder(r)

			for {
				hdr, err := r.NextFrame()
				if err != nil {
					continue
				}

				if hdr.OpCode == ws.OpClose {
					return
				}

				var e Event
				if err := decoder.Decode(&e); err != nil {
					log.Println("Error parsing JSON")
					return
				}
				eventHandler(&e, c, s)

				if err = w.Flush(); err != nil {
					return
				}
			}
		}()
	})

	return f
}
