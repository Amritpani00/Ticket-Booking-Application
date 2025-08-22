#!/usr/bin/env bash
set -euo pipefail

# Config
DATA_DIR="${DATA_DIR:-/workspace/mysql-data}"
SOCK="${SOCK:-/workspace/mysql.sock}"
PORT="${PORT:-3306}"
HOST="${HOST:-127.0.0.1}"
DB_NAME="${DB_NAME:-ticketdb}"
DB_USER="${DB_USER:-app}"
DB_PASS="${DB_PASS:-password}"
BACKEND_DIR="${BACKEND_DIR:-/workspace/ticket-booking-backend}"

log() { echo "[$(date +%H:%M:%S)] $*"; }

start_mysql() {
	mkdir -p "$DATA_DIR"
	if [ ! -d "$DATA_DIR/mysql" ]; then
		log "Initializing MySQL data directory at $DATA_DIR"
		mysqld --initialize-insecure --datadir="$DATA_DIR" --log-error="$DATA_DIR/init.err"
	fi
	if pgrep -x mysqld >/dev/null 2>&1; then
		log "mysqld already running"
	else
		log "Starting mysqld"
		nohup mysqld --datadir="$DATA_DIR" --socket="$SOCK" --port="$PORT" --bind-address="$HOST" --log-error="$DATA_DIR/mysql.err" >/workspace/mysql.out 2>&1 &
	fi
	# Wait for readiness
	for i in {1..60}; do
		if mysqladmin ping -h"$HOST" -P"$PORT" -uroot --protocol=TCP >/dev/null 2>&1; then
			log "MySQL is ready"
			return 0
		fi
		sleep 1
	done
	log "MySQL failed to start"
	exit 1
}

provision_db() {
	log "Provisioning database and user"
	mysql -h"$HOST" -P"$PORT" -uroot --protocol=TCP <<SQL
CREATE DATABASE IF NOT EXISTS \`$DB_NAME\`;
CREATE USER IF NOT EXISTS '$DB_USER'@'%' IDENTIFIED BY '$DB_PASS';
GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_USER'@'%';
FLUSH PRIVILEGES;
SQL
}

start_backend() {
	log "Starting backend against MySQL"
	cd "$BACKEND_DIR"
	DB_URL="jdbc:mysql://$HOST:$PORT/$DB_NAME?allowPublicKeyRetrieval=true&useSSL=false&serverTimezone=UTC" \
	DB_USERNAME="$DB_USER" \
	DB_PASSWORD="$DB_PASS" \
	RAZORPAY_ENABLED=false \
	nohup mvn -q -e -DskipTests spring-boot:run >/workspace/backend_mysql.out 2>&1 &
	# Wait for backend
	for i in {1..60}; do
		if curl -sSf "http://localhost:8080/api/events" >/dev/null 2>&1; then
			log "Backend is up at http://localhost:8080"
			return 0
		fi
		sleep 1
	done
	log "Backend failed to start"
	exit 1
}

start_mysql
provision_db
start_backend

log "All services started."