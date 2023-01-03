import axios from 'axios';
// import fsp from 'fs/promises';

const pageLoader = (url /* dir = process.cwd() */) => {
  const result = axios.get(url)
    .then((response) => console.log(response));
  return result;
};
export default pageLoader;
