import fs from 'fs';
import path from 'path';

interface Developer {
  id: number;
  name: string;
  github: string;
  address: string;
  bootcamp: {
    graduated: number;
    contributor: number;
  };
  xrank: number;
  x_handle: string | null;
}

const kaiaDevelopersJsonPath = path.join(__dirname, '../lib/mocks/kaia-developers.json');

const kaiaDevelopersJson = JSON.parse(fs.readFileSync(kaiaDevelopersJsonPath, 'utf8'));

// add the x_handle to the kaiaDevelopersJson
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const kaiaDevelopers = kaiaDevelopersJson as Developer[];

// add the x_handle field with null to all the developers in the kaiaDevelopersJson
const kaiaDevelopersWithXHandle = kaiaDevelopers.map((developer) => ({
  ...developer,
  x_handle: null
}));

// write the kaiaDevelopersWithXHandle to the kaiaDevelopersJsonPath
fs.writeFileSync(kaiaDevelopersJsonPath, JSON.stringify(kaiaDevelopersWithXHandle, null, 2));

