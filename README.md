TaskTrackApp 
=====================

Amaç
-----
TaskTrackApp; görev ve kullanıcı yönetimini modüler mikroservis mimarisiyle sunan, konteynerize edilebilir bir .NET tabanlı uygulamadır. Odak: **ölçeklenebilirlik**, **gözlemlenebilirlik**, **kolay devreye alma**.

Mimari Kapsam
--------------
- MainService — Kullanıcı yaşam döngüsü, profil yönetimi, Görev CRUD, atama, durum/öncelik akışları.

Teknolojiler
-------------
- .NET / C#
- Docker (containerization)
- Docker Compose, Swagger

Hızlı Başlangıç 
-----------------------------
Her servis için tipik akış:
1) Dizine girin:
    - `cd MainService`
2) Bağımlılıkları indirin:
    - `dotnet restore`
3) Derleyin:
    - `dotnet build -c Release`
4) Çalıştırın:
    - `dotnet run`

> Not: Varsayılan portlar `appsettings.json` / `launchSettings.json` altında tanımlı.

Hızlı Başlangıç (Docker)
-------------------------
`docker compose up -d` komutunu çalıştırın.

API Yüzeyi (Örnek Taslak)
--------------------------

UserService
  - GET api/users
  - GET api/user/{id}
  - POST api/user
  - PUT api/users/{id}
  - DELETE /users/{id}

TaskService
  - GET /tasks
  - GET /task/{id}
  - POST /task
  - PUT /tasks/{id}
  - DELETE /tasks/{id}
