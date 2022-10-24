# Readme

## Miscellaneous Notes

### Setup

- Created new project using `@nestjs/cli@6.10` to conform with the version requirements. However, this lead to a few
  dependency issues caused by the starter project. I was forced to adjust/pin certain dependencies to not get stuck on
  this. For the sake of completeness, here are some of the issues that helped me resolve the problem:
  - pinning `jest` with version `>=25.x`
  - [@types/webpack and @types/tapable](https://github.com/nestjs/nest/issues/6758)
  - pinning `@types/express-serve-static-core` explicitly to a version that is compatible with `@types/node@16` (to be compatible with node@16)
- I did not check for every nest config file whether it is actually necessary. If I was doing this for a production-like
  environment, I would make sure that there are no unnecessary files in the project.
- I (optionally) used [volta](https://volta.sh/) for pinning the node version to `16.18.0` (implies npm@8.19.2) for local development.
  In production the version would be enforced by the respective docker image. Keeping this in sync can be enforced by a
  simple unit test which parses the `package.json` and the `Dockerfile`(s).
