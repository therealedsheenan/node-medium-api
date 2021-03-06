# node-medium-api
Just another medium clone made with Node and Typescript


## Install application
```
$ npm install # yarn
```

## Build typescript
```
$ npm run build # yarn build
```

## Run developmentserver
```
$ npm run dev # yarn dev
```

### Migrations
Executing migration files
```
$ npm run schema:run-migrations # yarn schema:run-migrations
```

Synching schema
```
$ npm run schema:sync # yarn schema:sync
```

Dropping schema
```
$ npm run schema:drop # yarn schema:drop
```

### Run seed file
```
$ npm run seed # yarn seed
```

By default, posts are not `published`, login the account from the `seed.ts` file and `publish` to see posts from the home page.

#### Environment variables
Rename `.env.sample` to `.env`

#### More information
Know more about typeorm here: http://typeorm.io

#### Author
Sheenan Tenepre
