package utils

import (
	"errors"
	"log"
	"os"
	"time"

	"github.com/quanphung1120/advanced-quiz-be/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var (
	db    *gorm.DB
	dbErr error
)

func InitializeDatabase() (*gorm.DB, error) {
	db = func() *gorm.DB {
		databaseURL := os.Getenv("DATABASE_URL")
		if databaseURL == "" {
			dbErr = errors.New("DATABASE_URL environment variable is required")
			return nil
		}

		gormConfig := &gorm.Config{
			Logger: logger.Default.LogMode(logger.Silent),
		}

		database, err := gorm.Open(postgres.Open(databaseURL), gormConfig)
		if err != nil {
			dbErr = err
			return nil
		}

		sqlDB, err := database.DB()
		if err != nil {
			dbErr = err
			return nil
		}

		// Set connection pool settings
		sqlDB.SetMaxOpenConns(25)
		sqlDB.SetMaxIdleConns(5)
		sqlDB.SetConnMaxLifetime(5 * time.Minute)

		err = sqlDB.Ping()
		if err != nil {
			dbErr = err
			return nil
		}

		// Auto-migrate models here if needed
		err = database.AutoMigrate(
			&models.Collection{},
			&models.CollectionCollaborator{},
			&models.Flashcard{},
		)

		if err != nil {
			dbErr = err
			return nil
		}

		log.Println("Database connection established successfully")
		return database
	}()

	return db, dbErr
}

func GetDatabase() *gorm.DB {
	return db
}

// CloseDatabase closes the underlying *sql.DB. Call this on application shutdown.
// If the DB wasn't initialized, it returns nil.
func CloseDatabase() error {
	if db == nil {
		return nil
	}

	sqlDB, err := db.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}
