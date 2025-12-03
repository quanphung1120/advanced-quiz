package di

import (
	"github.com/quanphung1120/advanced-quiz-be/src/config"
	"github.com/quanphung1120/advanced-quiz-be/src/delivery/http/handlers"
	"github.com/quanphung1120/advanced-quiz-be/src/delivery/http/routes"
	"github.com/quanphung1120/advanced-quiz-be/src/infrastructure/external"
	infrarepo "github.com/quanphung1120/advanced-quiz-be/src/infrastructure/repositories"
	"github.com/quanphung1120/advanced-quiz-be/src/usecases"
	"go.uber.org/dig"
)

func BuildContainer() *dig.Container {
	container := dig.New()

	provideConfig(container)
	provideRepositories(container)
	provideUseCases(container)
	provideHandlers(container)
	provideRoutes(container)

	return container
}

func provideConfig(container *dig.Container) {
	container.Provide(config.InitializeDatabase)
}

func provideRepositories(container *dig.Container) {
	container.Provide(infrarepo.NewPostgresCollectionRepository)
	container.Provide(infrarepo.NewPostgresFlashcardRepository)
	container.Provide(external.NewClerkUserRepository)
}

func provideUseCases(container *dig.Container) {
	container.Provide(usecases.NewCollectionUseCase)
	container.Provide(usecases.NewFlashcardUseCase)
	container.Provide(usecases.NewUserUseCase)
}

func provideHandlers(container *dig.Container) {
	container.Provide(handlers.NewCollectionHandler)
	container.Provide(handlers.NewFlashcardHandler)
	container.Provide(handlers.NewUserHandler)
}

func provideRoutes(container *dig.Container) {
	container.Provide(routes.NewRouter)
}
