package db

import (
	"log"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func Init() *gorm.DB {
	db, err := gorm.Open(sqlite.Open("./data/db.sqlite"), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect database")
	}

	db.AutoMigrate(&Assets{}, &Object{}, &Scene{}, &Animation{}, &Create{})

	return db
}
