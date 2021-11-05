package db

import "gorm.io/gorm"

// Object
type Object struct {
	gorm.Model
	File      string
	FrameSize float64
}

type Animation struct {
	gorm.Model
	Name     string
	Frames   string // "1,2,3" parse to array[1,2,3]
	Object   Object
	ObjectID int
}

// Scene
type Scene struct {
	gorm.Model
	Name     string
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
