import {
  test, expect, beforeEach, beforeAll,
} from '@jest/globals';
import os from 'os';
import nock from 'nock';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fsp from 'fs/promises';
import prettier from 'prettier';
import pageLoader from '../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getFixturePath = (filename) => join(__dirname, '..', '__fixtures__', filename);
const readFixture = (filename) => fsp.readFile(getFixturePath(filename), 'utf-8');

nock.disableNetConnect();

let tmpDir;
let beforeHTML;
let afterHtml;
let expectedImage;

beforeAll(async () => {
  beforeHTML = await readFixture('before.html');
  afterHtml = await readFixture('after.html');
  expectedImage = await readFixture('image.png');
});

beforeEach(async () => {
  tmpDir = await fsp.mkdtemp(join(os.tmpdir(), 'page-loader-'));
});

test('1) Should return right file name "ru-hexlet-io-courses.html"', async () => {
  nock('https://ru.hexlet.io').get('/courses').reply(200, beforeHTML);
  nock('https://ru.hexlet.io').get('/assets/professions/nodejs.png').reply(200, expectedImage);
  nock('https://ru.hexlet.io').get('/courses').reply(200, afterHtml);
  await pageLoader('https://ru.hexlet.io/courses', tmpDir);
  const file = await fsp.readdir(tmpDir);
  console.log(file[0]);
  expect(file[0]).toEqual('ru-hexlet-io-courses.html');
});

test('2) Should load page', async () => {
  nock('https://ru.hexlet.io').persist().get('/courses').reply(200, beforeHTML);
  nock('https://ru.hexlet.io').get('/assets/professions/nodejs.png').reply(200, expectedImage);
  nock('https://ru.hexlet.io').get('/courses').reply(200, afterHtml);
  await pageLoader('https://ru.hexlet.io/courses', tmpDir);
  const fileName = await fsp.readdir(tmpDir);
  const page = await fsp.readFile(join(tmpDir, fileName[0]), 'utf-8');
  const formatedPage = prettier.format(page, { parser: 'html' });
  const formatedfixture = prettier.format(afterHtml, { parser: 'html' });

  expect(formatedPage).toEqual(formatedfixture);
});

test('3) Should create dir: "ru-hexlet-io-courses_files"', async () => {
  nock('https://ru.hexlet.io').persist().get('/courses').reply(200, beforeHTML);
  nock('https://ru.hexlet.io').get('/assets/professions/nodejs.png').reply(200, expectedImage);
  nock('https://ru.hexlet.io').get('/courses').reply(200, afterHtml);
  await pageLoader('https://ru.hexlet.io/courses', tmpDir);
  const fullDirPath = join(tmpDir, 'ru-hexlet-io-courses_files');
  const stats = await fsp.stat(fullDirPath);
  const file = await fsp.readdir(tmpDir);
  expect(stats.isDirectory()).toBe(true);
  expect(file[1]).toEqual('ru-hexlet-io-courses_files');
});

test('4) Should load img with right name: "ru-hexlet-io-assets-professions-nodejs.png"', async () => {
  nock('https://ru.hexlet.io').get('/courses').reply(200, beforeHTML);
  nock('https://ru.hexlet.io').get('/courses').reply(200, afterHtml);
  nock('https://ru.hexlet.io').get('/assets/professions/nodejs.png').reply(200, expectedImage);

  await pageLoader('https://ru.hexlet.io/courses', tmpDir);
  const dirName = await fsp.readdir(tmpDir);
  const imgName = await fsp.readdir(join(tmpDir, dirName[1]));

  expect(imgName[0]).toEqual('ru-hexlet-io-assets-professions-nodejs.png');
});

test('5) Should load img', async () => {
  nock('https://ru.hexlet.io').get('/courses').reply(200, beforeHTML);
  nock('https://ru.hexlet.io').get('/courses').reply(200, afterHtml);
  nock('https://ru.hexlet.io').get('/assets/professions/nodejs.png').reply(200, expectedImage);
  await pageLoader('https://ru.hexlet.io/courses', tmpDir);
  const dirName = await fsp.readdir(tmpDir);
  const imgName = await fsp.readdir(join(tmpDir, dirName[1]));
  const img = await fsp.readFile(join(tmpDir, dirName[1], imgName[0]));

  expect(img).toBe(expectedImage);
});
