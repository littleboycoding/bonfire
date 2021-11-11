package db

import "gorm.io/gorm"

type Assets struct {
	gorm.Model
	Name string `json:"name"`
}

type Object struct {
	gorm.Model
	Name        string      `json:"name"`
	AssetName   string      `json:"assetName"`
	Animations  []Animation `json:"animations"`
	FrameWidth  float64     `json:"frameWidth"`
	FrameHeight float64     `json:"frameHeight"`
	Variables   string      `json:"variables"`
}

type Animation struct {
	gorm.Model
	Name     string `json:"name"`
	Frames   string `json:"frames"`
	ObjectID int
}

type Scene struct {
	gorm.Model
	Name string
}

type Create struct {
	gorm.Model
	X        float64
	Y        float64
	Object   Object
	ObjectID int
	Scene    Scene
	SceneID  int
}
