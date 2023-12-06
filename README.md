# guoffu

![Dog clicking](./assets/images/guoffu.png)


Sign in/out on Woffu from the command line. It will take care of ignoring weekends, holidays, and events!

## Install

```
npm install
```

## Usage

Configure environment variables:

```
WOFFU_COMPANY=spacex
WOFFU_USERNAME=elon@spacex.com
WOFFU_PASSWORD=tesla
```

Execute sign in/out:

```
./index.mjs
```

## Schedule

Feel free to use any scheduling tool you like to handle the sign in/out process.

### Schedule as a Gitlab CI task

1. Fork this repo.
1. [Schedule a pipeline](https://docs.gitlab.com/ee/ci/pipelines/schedules.html)
    to your desired signin/signout intervals. You can use the cron syntax to create a single schedule (`0 9,13,14,18 * * MON-FRI`) or create different schedules depending on the time of the year, like months of _full working days_ (`0 9,13,14,18 * 1,2,3,4,5,6,7,9,10,11,12 MON-FRI`) and months of _intensive working days_ (`0 8,15 * 8 MON-FRI`).
1. Add `WOFFU_COMPANY`, `WOFFU_USERNAME`, and `WOFFU_PASSWORD` as [CI variables](https://docs.gitlab.com/ee/ci/variables/).
1. Let Gitlab CI/CD work its magic 🧙 (even receiving an email if in the process something went wrong).

