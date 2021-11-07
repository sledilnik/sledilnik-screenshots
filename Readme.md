# Sledilnik Screenshots

Based on [SledilnikScreenshots](https://github.com/VesterDe/SledilnikScreenshots).

Calling URL with appropriate query params will return `image/png` `base64` encoded.

## Developing new screenshot

Run `yarn` to install everything. You are now ready.

Add your new screenshot settings into an appropriate key inside screenshots.js.

In `test.js` set `query` variable to match your screenshot.

Running `node test.js` should make your screenshot on your local machine.

If you want to observe what is going on, set variable `headless` to `false`.

## Deploying

Just push to master, the code will be live about 60 seconds after that.

## Screenshots

There are 3 types of screenshots:

1. CARD

   Creates one of 8 cards from [Covid-19 Sledilnik](https://covid-19.sledilnik.org/sl/stats).

2. MULTICARD

   CARD combination.

   Use `include` field to specify which cards you want to be in screenshot.

3. CHART

   All possible default charts; see: [Embed charts](https://github.com/sledilnik/website/blob/master/examples/README.md) (\*documentation is not updated) and custom charts.

   Default chart is chart which is loaded without user interaction.

   Custom chart is chart with user interaction. Could be hover over line chart, change date range, etc.

4. CARD_EMBED

   Base url: 'https://covid-19.sledilnik.org/embed.html#/card'
   All embed cards paths:

   - /confirmedCases
   - /active
   - /hospitalized
   - /icu
   - /deceased
   - /testsToday
   - /testsTodayHAT
   - /casesAvg7Days
   - /casesActive100k
   - /vaccinationSummary

## Query params

### Mandatory params

- `type`: "CARD" | "MULTICARD" | "CHART" | "CARD_EMBED",
- `screen`: appropriate [type] key e.g. for MULTICARD could be "LAB", "HOS" or "ALL".

```javascript
// CARD
const queryParams = {
  type: 'card',
  screen: 'testsToday',
};

// CARD_EMBED
const queryParams = {
  type: 'card_embed',
  screen: 'testsToday',
};
```

### Optional params

- `immediateDownload`: Boolean (default = false)

Only for CHART!

- `custom`: custom chart key/name,
- `hoverIndex`: show tooltip for index,
- `hideLegend`: if `true` removes selectors for screenshot type; see: `OPTIONS` in `screenshots.js`,
- `dateFrom` and `dateTo`: sets date range input (CHART only).

```javascript
const queryParams = {
  type: 'chart',
  screen: 'Schools',
  custom: 'activeAbsolutePupilsFourMonths',
};
```

```javascript
const queryParams = {
  type: 'chart',
  screen: 'MetricsComparison',
  custom: 'casesConfirmed7DaysAvgFourMonthsTooltip',
  hoverIndex: '5',
  hideLegend: 'false',
  dateFrom: '01. 01. 2021', // format "dd. mm. yyyy"
  dateTo: '30. 04. 2021', // format "dd. mm. yyyy"
};
```
