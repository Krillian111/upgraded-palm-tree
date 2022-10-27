# Readme

Note: Subsections are ordered in reversed order of implementation to have the most relevant section about the API first.

## Skipped

As agreed I skipped the following topics:

- Authentication/Authorization
- Fully functioning create/update/delete
  - There is only a very simplified post request for manual testing and e2e tests

## TODO

- GET /services/{service_id}
  - return full data model of service
  - expand option for version
- GET /services/{service_id}/versions/{version_id}
  - return full data model of version

## API design consideration

### GET /services/:service_id

- Id validation uses `ParseIntPipe` which truncates floats. If that is not desired, one would probably have to implement a custom pipe.

### GET /services

- Assuming the standard use case for this request is rendering the Services view, we can directly limit the columns
  fetched from the database to not "overfetch".

#### Pagination

- I couldn't get `ParseIntPipe` to work with the fact that both parameters are optional, thus I had to manually build the
  validation. Usually I would dig deeper because I am sure this is a common scenario. If it does not exist out of the box by
  combining some pipes, I would probably write a Custom Pipeline instead.
  Note: Floats are truncated to an integer, I didn't want to spend too much time on such a detail, one could obviously also reject such a value.
- I opted for a simple `limit`+`offset` approach. The major drawback of it is the degrading performance for very large
  tables. Judging from the mockup and how I expect the API to be used, I assume that a single user is not going to
  have 100k+ services, thus the reduced complexity seemed to be a good tradeoff given the requirements.
- The fact that we might miss an element or see duplicates when navigation and deletion intertwine does not seem like
  a big concern given the use case.
- If we wanted to support such huge amounts of services, we would probably move towards a cursor-based pagination but
  that brings more complexity with it when it comes to a stable implementation of sorting, see [this blog as an example](https://shopify.engineering/pagination-relative-cursors).
- The metadata for the pagination panel can be derived on the client side if we include `limit`, `offset` and `count`
  in the response.
  - back link: backlink-offset=max(0,offset-limit) OR disabled if offset=0
  - forward link: forward-offset=offset+limit OR disabled if offset+limit>=count
  - current page: (offset/limit)+1 as I assume that page 0 on the mockup was not intentional
  - max page: count/limit
- Returning the `count` to allow the max page to be displayed can be costly for large tables. If we expect very large
  amounts of services to be returned, it might be worth thinking about dropping that requirement unless it adds a lot
  of value.
- An upper bound for `limit` (<=100) should ensure that we don't have to return an unreasonably large response.
- Only supplying one or the other of `limit` and `offset` returns a 400 as there are various interpretations possible. Instead of pushing the client to fix this bug, we could alternatively ignore the input and use both default values
  instead.
- The default values are `12` for limit (from mockup) and an offset of `0`. This is primarily to avoid unintended huge
  responses/backend processing time if a client forgets the parameters.

#### Filtering / Search

- Query parameter `filter` is passed to the where clause to match with the name if it is present.
- If we decide to apply the filter to another column or multiple columns, we could either adjust the current behaviour
  (breaking change) or introduce an additional `filter_by` parameter.
- Added index to `name` column to speed up the matching. This is not always a no-brainer as it slows insert performance
  but with the given UI, the frequency of such queries should be relatively high compared to the inserts.
- As the user input gets passed to our SQL query, we could think about specifying and enforcing a maximum length,
  especially if the column has a max width anyway. This would avoid passing unnecessary long strings to the database.

#### Sorting

- Query parameter `sort` with values `ASC`/`DESC` is passed to order by name clause
- If we decide to sort by different columns than `name`, we could add a `sort_by` parameter later.
- Potentially we could sort by various columns and orders but the sorting I would expect as a user would be a
  lexicographical sorting of the name. If no sorting parameter is supplied, no sorting is done to not prematurely affect
  query performance. One could also argue that forcing an `ASC` order would be good default if the main use case is the
  GUI from the mockup.
- I manually implemented a validation of the sort parameter to only allow whitelisted values, but I am sure there is a
  way to use a custom pipe for this instead.

### Data modeling - General

- Auto increment primary keys because it is unnecessary to introduce the performance overhead of a uuid without leveraging
  any of its properties
- I tried to guess some reasonable limits for column sizes, e.g. description, name or value range for number types.
  Whether these are appropriate or not obviously heavily depends on the actual use case.

### Security

- SQL injection: As far as I understand TypeORM translates queries like `find({where: someUserInput})` into a prepared
  statement, thus no escaping is necessary. Ideally I would take the time to actually verify this by double-checking the generated/used SQL. In addition, it would be a good idea to have a simple test verifying this to prevent regression in case there is a bug introduced into TypeORM at a later stage.

### Misc

- Added simple POST to enable easier automatic and manual testing
  - I explicitly do not perform any validation on the input due to the scope of the project. Usually I would use something like the [validators offered by NestJS](https://docs.nestjs.com/techniques/validation)
  - I also skipped writing unit tests for this because it does not represent a proper implementation and was only for
    testing the GET endpoints. I added some integration tests to make sure it fulfills its testing purpose.

## Test Setup

- As the repo mocks grow over time, I would probably move to something like ts-auto-mock unless there is something more
  convenient/appropriate already built into NestJS.
- At least one of the tests is leaking a handle, usually I would investigate and fix this but in the interest of time, I left it for now. I assume it has something to do with the fact that the TypeORM module is recreated for every test and we might have to do some proper cleanup afterwards.

## Docker Setup

- Simple compose to allow running app with attached database
- By starting the database by itself (`docker compose up -d db`), it can also be used for running the e2e tests.

## Database Setup

- DB credentials are hard coded for simplicity, usually these would be passed as part of the environment config, e.g.
  via [NestJSs config module](https://docs.nestjs.com/techniques/configuration)
- `synchronize:true` only for quick setup, usually I would initialize the db (including the initial schema) via SQL script and after that leverage TypeORM migrations

## Initial Setup

- Created new project using `@nestjs/cli@6.10` to conform with the version requirements. However, this lead to a few
  dependency issues caused by the starter project. I was forced to adjust/pin certain dependencies to not get stuck on
  this. For the sake of completeness, here are some of the issues I had to resolve:
  - pinning `jest` with version `>=25.x`
  - [@types/webpack and @types/tapable](https://github.com/nestjs/nest/issues/6758)
  - pinning `@types/express-serve-static-core` explicitly to a version that is compatible with `@types/node@16` (to be compatible with node@16)
- I did not check for every nest config file whether it is actually necessary. If I was doing this for a production-like
  environment, I would make sure that there are no unnecessary files in the project.
- I (optionally) used [volta](https://volta.sh/) for pinning the node version to `16.18.0` (implies npm@8.19.2) for local development.
  In production the version would be enforced by the respective docker image. Keeping this in sync can be enforced by a
  simple unit test which parses the `package.json` and the `Dockerfile`(s).
