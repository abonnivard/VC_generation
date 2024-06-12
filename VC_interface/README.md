### Quick start

1. Install a PostgreSQL server.

https://postgresapp.com/

2. Connect a PostgreSQL database to the application by creating a `.env` file in the root directory (root directory of VC_interface) with the following content:

```bash
DB_ENGINE=django.db.backends.postgresql_psycopg2
DB_NAME=...
DB_USER=...
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=5432
```
Change the values of `DB_NAME`, `DB_USER`, and `DB_PASSWORD` to match your PostgreSQL database configuration.

2. Execute the following command to start the application:

```bash
make
```

Alternatively, you can run the following commands:

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```