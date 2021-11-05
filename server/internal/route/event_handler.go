package route

import (
	"log"
)

func eventHandler(e *Event, c *Client, s *Subscription) {
	switch e.Event {
	case "DROP_OBJECT":
		data, ok := e.Data.(map[string]interface{})
		if !ok {
			s.Broadcast(c, "ERROR", "Invalid position")
		} else {
			_, xOk := data["x"].(float64)
			_, yOk := data["y"].(float64)
			_, indexOk := data["index"].(float64)
			_, sceneOk := data["scene"].(string)

			if xOk && yOk && indexOk && sceneOk {
				s.BroadcastFromClient(c, "DROP_OBJECT", data)
			}
		}
	default:
		log.Println("Unmatched event name")
	}
}
