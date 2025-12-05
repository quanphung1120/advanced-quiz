package config

import (
	"context"
	"database/sql"
	"errors"
	"log"
	"os"
	"time"

	"entgo.io/ent/dialect"
	entsql "entgo.io/ent/dialect/sql"
	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/quanphung1120/advanced-quiz-be/ent"
)

func InitializeDatabase() (*ent.Client, error) {
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		return nil, errors.New("DATABASE_URL environment variable is required")
	}

	// Open the database connection
	db, err := sql.Open("pgx", databaseURL)
	if err != nil {
		return nil, err
	}

	// Configure connection pooling
	db.SetMaxIdleConns(10)
	db.SetMaxOpenConns(100)
	db.SetConnMaxLifetime(time.Hour)

	// Verify connection
	if err := db.Ping(); err != nil {
		return nil, err
	}

	// Create Ent client
	drv := entsql.OpenDB(dialect.Postgres, db)
	client := ent.NewClient(ent.Driver(drv))

	// Run auto migration
	ctx := context.Background()
	if err := client.Schema.Create(ctx); err != nil {
		return nil, err
	}

	log.Println("Database connection established successfully")
	return client, nil
}
