#!/usr/bin/env node

import 'dotenv/config'
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';

const COMPANY = process.env.WOFFU_COMPANY;
const USERNAME = process.env.WOFFU_USERNAME;
const PASSWORD = process.env.WOFFU_PASSWORD;

const USER_AGENT =
  'Morcilla/5.0 (X11; Ubuntu; Linux x86_64; rv:98.0) Gecko/20100101 Firefox/98.0';
const BASE_URL = `https://${COMPANY}.woffu.com`;

function log(message) {
  console.log(`${new Date().toISOString()}: ${message}`);
}

function getUserId(token) {
  return jwt.decode(token).UserId;
}

function getCurrentLocalDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

async function login() {
  log(`logging in as ${USERNAME}`);
  const body = `username=${USERNAME}&password=${PASSWORD}&grant_type=password`;
  const response = await fetch(`${BASE_URL}/token`, {
    'credentials': 'omit',
    'headers': {
      'User-Agent': USER_AGENT,
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.5',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin'
    },
    'referrer': `${BASE_URL}/v2/login`,
    'method': 'POST',
    'mode': 'cors',
    body
  });

  if (response.status !== 200) {
    throw new Error(
      `Failed to login ${response.status}: ${response.statusText}`);
  }
  log(`login ${response.status} ${response.statusText}`);

  const payload = await response.json();
  log(`logged in as ${payload.userName}`);

  return payload.access_token;
}

async function isWorkDay(token) {
  log('checking if it is a work day');
  const userId = getUserId(token);
  const today = getCurrentLocalDate();
  const response = await fetch(`${BASE_URL}/api/users/${userId}/diaries/presence?fromDate=${today}&pageIndex=0&pageSize=1&toDate=${today}`, {
    'credentials': 'include',
    'headers': {
      'User-Agent': USER_AGENT,
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.5',
      'Authorization': `Bearer ${token}`,
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'no-cors',
      'Sec-Fetch-Site': 'same-origin',
      'Pragma': 'no-cache',
      'Cache-Control': 'no-cache'
    },
    'referrer': BASE_URL,
    'method': 'GET',
    'mode': 'cors'
  });

  if (response.status !== 200) {
    throw new Error(
      `Failed to check work day ${response.status}: ${response.statusText}`);
  }
  log(`isWorkDay ${response.status} ${response.statusText}`);

  const payload = await response.json();
  const { IsWeekend, IsHoliday, IsEvent } = payload.Diaries[0];
  log(`IsWeekend: ${IsWeekend}, IsHoliday: ${IsHoliday}, IsEvent: ${IsEvent}`);

  return !(IsWeekend || IsHoliday || IsEvent)
}

async function isWorkDayLite(token) {
  log('checking if it is a work day');
  const userId = getUserId(token);
  const response = await fetch(`${BASE_URL}/api/users/${userId}/workdaylite`, {
    'credentials': 'include',
    'headers': {
      'User-Agent': USER_AGENT,
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.5',
      'Authorization': `Bearer ${token}`,
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'no-cors',
      'Sec-Fetch-Site': 'same-origin',
      'Pragma': 'no-cache',
      'Cache-Control': 'no-cache'
    },
    'referrer': BASE_URL,
    'method': 'GET',
    'mode': 'cors'
  });

  if (response.status !== 200) {
    throw new Error(
      `Failed to check work day ${response.status}: ${response.statusText}`);
  }
  log(`isWorkDay ${response.status} ${response.statusText}`);

  const payload = await response.json();
  const { IsWeekend, IsHoliday, IsEvent } = payload;
  log(`IsWeekend: ${IsWeekend}, IsHoliday: ${IsHoliday}, IsEvent: ${IsEvent}`);

  return !(IsWeekend || IsHoliday || IsEvent)
}

async function sign(token) {
  log('signing in');
  const body = JSON.stringify({
    UserId: getUserId(token),
    signIn: true,
    TimezoneOffset: new Date().getTimezoneOffset(),
    DeviceId: 'WebApp',
    RequestId: null,
    AgreementEventId: null
  });
  const response = await fetch(`${BASE_URL}/api/svc/signs/signs`, {
    'credentials': 'include',
    'headers': {
      'User-Agent': USER_AGENT,
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.5',
      'Content-Type': 'application/json;charset=utf-8',
      'Authorization': `Bearer ${token}`,
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin'
    },
    'referrer': BASE_URL,
    'method': 'POST',
    'mode': 'cors',
    body
  });

  if (response.status !== 201) {
    throw new Error(
      `Failed to sign ${response.status}: ${response.statusText}`);
  }
  log(`sign ${response.status} ${response.statusText}`);
}

const token = await login();
if (await isWorkDay(token)) {
  await sign(token);
}
