import { useState, useEffect, createContext } from "react";
import initSqlJs from "sql.js";

export const SqliteContext = createContext();

const DB_SQLITE_URL = "http://localhost:8080/resources/db.sqlite";
const SQLITE_WASM_URL = "https://sql.js.org/dist/";

async function getSQL() {
  const SQL = await initSqlJs({
    locateFile: (file) => {
      return SQLITE_WASM_URL + file;
    },
  });
  return SQL;
}

async function getSQLBuffer() {
  const res = await fetch(DB_SQLITE_URL);
  const buf = await res.arrayBuffer().then((arr) => new Uint8Array(arr));
  return buf;
}

function SqliteProvider({ children }) {
  const [SQL, setSQL] = useState(null);
  const [sqlBuffer, setSQLBuffer] = useState(null);
  const [db, setDB] = useState(null);

  useEffect(() => {
    const setup = async () => {
      const [sql, buf] = await Promise.all([getSQL(), getSQLBuffer()]);
      setSQL(sql);
      setSQLBuffer(buf);
    };

    setup();
  }, []);

  useEffect(() => {
    if (SQL && sqlBuffer) {
      setDB(new SQL.Database(sqlBuffer));
    }
  }, [sqlBuffer, SQL]);

  // Initializing SQLite client
  if (SQL === null || sqlBuffer === null || db === null) return null;

  return <SqliteContext.Provider value={db}>{children}</SqliteContext.Provider>;
}

export { SqliteProvider };
