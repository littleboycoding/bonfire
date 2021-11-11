package handler

import (
	"fmt"
	"log"
	"os"
	"path"

	"github.com/gobwas/ws/wsutil"
	model "github.com/littleboycoding/bonfire/server/pkg/db"
	"github.com/mitchellh/mapstructure"
	"gorm.io/gorm"
)

type Resource string

const (
	ASSETS  Resource = "ASSETS"
	OBJECTS Resource = "OBJECTS"
	SCENES  Resource = "SCENES"
)

type UpdateEvent struct {
	Name Resource    `json:"name"`
	Item interface{} `json:"item"`
}

type ResourceOperation struct {
	Name     string      `json:"name"`
	Resource Resource    `json:"resource"`
	Info     interface{} `json:"info"`
}

func (s *Relay) eventHandler(e *Event, c *Client, db *gorm.DB) {
	// case "INSERT_CHAR":
	// 	var change struct {
	// 		Key     string `json:"key"`
	// 		Changes []struct {
	// 			Range struct {
	// 				StartLineNumber float64 `json:"startLineNumber"`
	// 				StartColumn     float64 `json:"startColumn"`
	// 				EndLineNumber   float64 `json:"endLineNumber"`
	// 				EndColumn       float64 `json:"endColumn"`
	// 			} `json:"range"`
	// 			Text string `json:"text"`
	// 		} `json:"changes"`
	// 	}
	// 	err := mapstructure.Decode(e.Data, &change)
	// 	if err != nil {
	// 		s.Broadcast(c, "ERROR", "Invalid data changing")
	// 	} else {
	// 		path := path.Join("./data/assets", change.Key)
	// 		file, err := os.Open(path)
	// 		defer file.Close()
	// 		if err != nil {
	// 			event := Event{"ERROR", err}
	// 			wsutil.WriteServerText(*c.Conn, event.Json())
	// 		}

	// 		b, err := io.ReadAll(file)
	// 		if err != nil {
	// 			event := Event{"ERROR", err}
	// 			wsutil.WriteServerText(*c.Conn, event.Json())
	// 		}

	// 		asset := string(b)
	// 		line := strings.Split(asset, "\n")
	// 		for _, change := range change.Changes {
	// 			start := int(change.Range.StartLineNumber)
	// 			end := int(change.Range.EndLineNumber)

	// 			r := line[start-1 : end]
	// 			if change.Range.StartLineNumber-change.Range.EndLineNumber != 0 {
	// 				r[0] = r[0][:int(change.Range.StartColumn)-1] + change.Text + r[len(r)-1][int(change.Range.EndColumn)-1:]
	// 				for i := 1; i < len(r); i++ {
	// 					r = remove(r, i)
	// 				}
	// 			} else {
	// 				r[0] = r[0][:int(change.Range.StartColumn)-1] + change.Text + r[0][int(change.Range.EndColumn)-1:]
	// 			}
	// 			fmt.Println(r)
	// 		}
	// 		err = os.WriteFile(path, []byte(strings.Join(line, "\n")), 0777)
	// 		if err != nil {
	// 			event := Event{"ERROR", err}
	// 			wsutil.WriteServerText(*c.Conn, event.Json())
	// 		}
	// 		s.BroadcastFromClient(c, "INSERT_CHAR", change)
	// 	}
	switch e.Event {
	case "UPDATE_ASSET":
		// Lazy way to implement asset editing... Must be implement in better ASAP
		var data struct {
			Name string `json:"name"`
			Text string `json:"text"`
		}
		err := mapstructure.Decode(e.Data, &data)
		if err != nil {
			event := Event{"ERROR", err}
			wsutil.WriteServerText(*c.Conn, event.Json())
			return
		}

		p := path.Join("./data/assets", data.Name)
		stat, _ := os.Stat(p)
		if stat == nil {
			event := Event{"ERROR", "File doesn't exist"}
			wsutil.WriteServerText(*c.Conn, event.Json())
			return
		}

		err = os.WriteFile(p, []byte(data.Text), 0777)
		if err != nil {
			event := Event{"ERROR", "Can't write file: " + err.Error()}
			wsutil.WriteServerText(*c.Conn, event.Json())
			return
		}
		s.BroadcastFromClient(c, "UPDATE_ASSET", data)
	case "DROP_OBJECT":
		var pos struct {
			X     float64 `json:"x"`
			Y     float64 `json:"y"`
			Index float64 `json:"index"`
			Scene string  `json:"scene"`
		}
		err := mapstructure.Decode(e.Data, &pos)
		if err != nil {
			s.Broadcast(c, "ERROR", err)
			return
		}
		s.BroadcastFromClient(c, "DROP_OBJECT", pos)
	case "CREATE_RESOURCE":
		var data ResourceOperation
		err := mapstructure.Decode(e.Data, &data)
		if err != nil {
			event := Event{"ERROR", err}
			wsutil.WriteServerText(*c.Conn, event.Json())
			return
		}

		switch data.Resource {
		case ASSETS:
			p := path.Join("./data/assets/", data.Name)
			stat, _ := os.Stat(p)
			if stat != nil {
				log.Printf("File `%s` already exist", data.Name)
				event := Event{"ERROR", "File already exists"}
				wsutil.WriteServerText(*c.Conn, event.Json())
				return
			}
			file, err := os.Create(p)
			defer file.Close()
			if err != nil {
				log.Printf("Error in creating `%s`", data.Name)
				event := Event{"ERROR", "File creation error"}
				wsutil.WriteServerText(*c.Conn, event.Json())
				return
			}
			asset := model.Assets{Name: data.Name}
			db.Create(&asset)
			s.BroadcastAll("CREATE_RESOURCE", data)
		case SCENES:
			var exist []model.Scene
			db.Where("name = ?", data.Name).Find(&exist)
			if len(exist) > 0 {
				log.Printf("Scene with name %s already exist", data.Name)
				event := Event{"ERROR", "Scene already exist"}
				wsutil.WriteServerText(*c.Conn, event.Json())
				return
			}

			scene := model.Scene{
				Name: data.Name,
			}

			db.Create(&scene)
			s.BroadcastAll("CREATE_RESOURCE", data)
		case OBJECTS:
			var info struct {
				AssetsID  float64 `json:"assetId"`
				FrameSize float64 `json:"frameSize"`
			}
			err := mapstructure.Decode(data.Info, &info)
			if err != nil {
				event := Event{"ERROR", err}
				fmt.Println(err)
				wsutil.WriteServerText(*c.Conn, event.Json())
				return
			}
			var exist []model.Object
			db.Where("name = ?", data.Name).Find(&exist)
			if len(exist) > 0 {
				log.Printf("Object with name %s already exist", data.Name)
				event := Event{"ERROR", "Object already exist"}
				wsutil.WriteServerText(*c.Conn, event.Json())
				return
			}
			object := model.Object{
				Name:       data.Name,
				Animations: []model.Animation{{Name: "Default"}},
			}

			db.Create(&object)
			s.BroadcastAll("CREATE_RESOURCE", data)
		}
	case "DELETE_RESOURCE":
		var data ResourceOperation
		err := mapstructure.Decode(e.Data, &data)
		if err != nil {
			event := Event{"ERROR", err}
			wsutil.WriteServerText(*c.Conn, event.Json())
		}

		switch data.Resource {
		case ASSETS:
			p := path.Join("./data/assets", data.Name)
			stat, _ := os.Stat(p)
			if stat == nil {
				event := Event{"ERROR", "File doesn't exist"}
				fmt.Println(err)
				wsutil.WriteServerText(*c.Conn, event.Json())
				return
			}
			err = os.Remove(p)
			if err != nil {
				event := Event{"ERROR", "Can't remove file: "}
				fmt.Println(err)
				wsutil.WriteServerText(*c.Conn, event.Json())
				return
			}
			db.Where("name = ?", data.Name).Delete(&model.Assets{})
			s.BroadcastAll("DELETE_RESOURCE", data)
		case SCENES:
			var scene model.Scene
			db.Where("name = ?", data.Name).First(&scene)

			db.Delete(&scene)
			s.BroadcastAll("DELETE_RESOURCE", data)
		case OBJECTS:
			var object model.Object
			db.Where("name = ?", data.Name).First(&object)

			// db.Model(&object).Association("Animations").Delete(&[]model.Animation{})
			db.Delete(&object)

			s.BroadcastAll("DELETE_RESOURCE", data)
		}
	case "RENAME_RESOURCE":
		var data ResourceOperation
		err := mapstructure.Decode(e.Data, &data)
		if err != nil {
			event := Event{"ERROR", err}
			wsutil.WriteServerText(*c.Conn, event.Json())
		}

		switch data.Resource {
		case ASSETS:
			var info struct {
				NewName string `json:"newName"`
			}
			err := mapstructure.Decode(data.Info, &info)
			if err != nil {
				event := Event{"ERROR", err}
				fmt.Println(err)
				wsutil.WriteServerText(*c.Conn, event.Json())
			}

			p := path.Join("./data/assets", data.Name)
			newP := path.Join("./data/assets", info.NewName)
			stat, _ := os.Stat(p)
			if stat == nil {
				event := Event{"ERROR", "File doesn't exist"}
				fmt.Println(err)
				wsutil.WriteServerText(*c.Conn, event.Json())
				return
			}

			stat, _ = os.Stat(newP)
			if stat == nil {
				event := Event{"ERROR", "File with name already exist"}
				fmt.Println(err)
				wsutil.WriteServerText(*c.Conn, event.Json())
				return
			}

			err = os.Rename(p, newP)
			if err != nil {
				event := Event{"ERROR", "Can't move file: "}
				fmt.Println(err)
				wsutil.WriteServerText(*c.Conn, event.Json())
				return
			}
			db.Model(&model.Assets{}).Where("name = ?", data.Name).Update("name", info.NewName)
			s.BroadcastAll("RENAME_RESOURCE", data)
		case SCENES:
			var scene model.Scene
			db.Where("name = ?", data.Name).First(&scene)

			var info struct {
				NewName string `json:"newName"`
			}
			err := mapstructure.Decode(data.Info, &info)
			if err != nil {
				event := Event{"ERROR", err}
				fmt.Println(err)
				wsutil.WriteServerText(*c.Conn, event.Json())
				return
			}

			var exist []model.Scene
			db.Where("name = ?", info.NewName).Find(&exist)
			if len(exist) > 0 {
				event := Event{"ERROR", "Scene with name already exist"}
				fmt.Println(err)
				wsutil.WriteServerText(*c.Conn, event.Json())
				return
			}

			scene.Name = info.NewName
			db.Save(&scene)
			s.BroadcastAll("RENAME_RESOURCE", data)
		case OBJECTS:
			var object model.Object
			db.Where("name = ?", data.Name).First(&object)

			var info struct {
				NewName string `json:"newName"`
			}
			err := mapstructure.Decode(data.Info, &info)
			if err != nil {
				event := Event{"ERROR", err}
				fmt.Println(err)
				wsutil.WriteServerText(*c.Conn, event.Json())
				return
			}

			var exist []model.Object
			db.Where("name = ?", info.NewName).Find(&exist)
			if len(exist) > 0 {
				event := Event{"ERROR", "Object with name already exist"}
				fmt.Println(err)
				wsutil.WriteServerText(*c.Conn, event.Json())
				return
			}

			object.Name = info.NewName
			db.Save(&object)
			s.BroadcastAll("RENAME_RESOURCE", data)
		}
	case "CREATE_ANIMATION":
		var data struct {
			ObjectName    string
			AnimationName string
		}
		err := mapstructure.Decode(e.Data, &data)
		if err != nil {
			event := Event{"ERROR", err}
			wsutil.WriteServerText(*c.Conn, event.Json())
			return
		}

		var object model.Object
		db.Where("name = ?", data.ObjectName).First(&object)

		animation := model.Animation{
			Name: data.AnimationName,
		}
		var exist []model.Animation
		db.Where("object_id = ? AND name = ?", object.ID, data.AnimationName).Find(&exist)
		if len(exist) > 0 {
			event := Event{"ERROR", "Animation already exist"}
			wsutil.WriteServerText(*c.Conn, event.Json())
			return
		}
		db.Model(&object).Association("Animations").Append(&animation)

		s.BroadcastAll("CREATE_ANIMATION", struct {
			ObjectName string          `json:"objectName"`
			Animation  model.Animation `json:"animation"`
		}{data.ObjectName, animation})
	case "DELETE_ANIMATION":
		var data struct {
			Name string  `json:"name"`
			Id   float64 `json:"id"`
		}
		err := mapstructure.Decode(e.Data, &data)
		if err != nil {
			event := Event{"ERROR", err}
			wsutil.WriteServerText(*c.Conn, event.Json())
			return
		}

		db.Delete(&model.Animation{}, data.Id)
		s.BroadcastFromClient(c, "DELETE_ANIMATION", data)
	case "UPDATE_OBJECT":
		var data struct {
			Name        string  `json:"name"`
			FrameWidth  float64 `json:"frameWidth"`
			FrameHeight float64 `json:"frameHeight"`
			Variables   string  `json:"variables"`
			AssetName   string  `json:"assetName"`
		}
		err := mapstructure.Decode(e.Data, &data)
		if err != nil {
			event := Event{"ERROR", err}
			wsutil.WriteServerText(*c.Conn, event.Json())
			return
		}

		var object model.Object
		db.Where("name = ?", data.Name).First(&object)

		object.FrameHeight = data.FrameHeight
		object.FrameWidth = data.FrameWidth
		object.Variables = data.Variables
		object.AssetName = data.AssetName

		db.Save(&object)

		s.BroadcastFromClient(c, "UPDATE_OBJECT", data)
	case "UPDATE_ANIMATION_FRAMES":
		var data struct {
			ObjectName string `json:"objectName"`
			Name       string `json:"name"`
			Frames     string `json:"frames"`
		}
		err := mapstructure.Decode(e.Data, &data)
		if err != nil {
			event := Event{"ERROR", err}
			wsutil.WriteServerText(*c.Conn, event.Json())
			return
		}
		var object model.Object
		db.Where("name = ?", data.ObjectName).First(&object)

		var animations []model.Animation
		db.Where("name = ? AND object_id = ?", data.Name, object.ID).First(&animations)
		if len(animations) == 0 {
			event := Event{"ERROR", "Animation not exist"}
			wsutil.WriteServerText(*c.Conn, event.Json())
			return
		}

		fmt.Println(animations)

		animation := animations[0]
		animation.Frames = data.Frames
		db.Save(&animation)
		s.BroadcastFromClient(c, "UPDATE_ANIMATION_FRAMES", data)
	default:
		log.Println("Unmatched event name")
	}
}
