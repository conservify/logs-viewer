build:
	docker build -t jlewallen/logs-viewer:master .

push: build
	docker push jlewallen/logs-viewer:master
