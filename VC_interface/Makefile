

all: setup install migrations start

# Créer l'environnement virtuel
setup:
	python3 -m venv env

# Installer les dépendances
install:
	. env/bin/activate && pip install -r requirements.txt && pip install --upgrade pip

# Démarrer le site
start:
	. env/bin/activate && python3 manage.py runserver

clean:
	rm -R env/

migrations:
	. env/bin/activate && python3 manage.py makemigrations && python3 manage.py migrate