package config

import (
	"errors"
	"log"
	"os"
	"time"

	"github.com/quanphung1120/advanced-quiz-be/src/domain/entities"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func InitializeDatabase() (*gorm.DB, error) {
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		return nil, errors.New("DATABASE_URL environment variable is required")
	}

	gormConfig := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	}

	database, err := gorm.Open(postgres.Open(databaseURL), gormConfig)
	if err != nil {
		return nil, err
	}

	sqlDB, err := database.DB()
	if err != nil {
		return nil, err
	}

	sqlDB.SetMaxIdleConns(10)           // idle connections
	sqlDB.SetMaxOpenConns(100)          // max open connections
	sqlDB.SetConnMaxLifetime(time.Hour) // max lifetime of a connection

	err = sqlDB.Ping()
	if err != nil {
		return nil, err
	}

	err = database.AutoMigrate(
		&entities.Collection{},
		&entities.CollectionCollaborator{},
		&entities.Flashcard{},
	)

	if err != nil {
		return nil, err
	}

	log.Println("Database connection established successfully")
	return database, nil
}
