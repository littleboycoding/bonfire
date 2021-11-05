import { SqliteContext } from "../context/sqlite";
import { useContext, useState } from "react";

function useSqlite(query) {
  const db = useContext(SqliteContext);
  const [result, setResult] = useState(db.exec(query));

  const updateResult = (data) => {
    const newResult = [...result];
    setResult(newResult)
  };

  return { result, updateResult };
}


export default useSqlite;
