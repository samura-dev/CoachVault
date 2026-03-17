#!/bin/bash
# Запуск PocketBase в dev-режиме с миграциями
# Использование: bash start.sh

./pocketbase serve --http="127.0.0.1:8090" --dir="./pb_data" --migrationsDir="./pb_migrations" --hooksDir="./pb_hooks"
