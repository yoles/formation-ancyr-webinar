NAME=$(shell basename $(shell pwd)):nestjs

build:
	docker build -t $(NAME) .

run:
	docker run -it --rm -v ${PWD}:/app  -p 3000:3000 -e CHOKIDAR_USEPOLLING=true $(NAME)

start: build run

ignore:
	echo "\n#Custom Docker files\nDockerfile\nmakefile\ninit.sh\nstart.sh" >> .gitignore
