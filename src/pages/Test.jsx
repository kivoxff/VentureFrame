import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase/config";

function test() {
  const func1 = async () => {
    const seedProducts = httpsCallable(functions, "seedTestProducts");
    await seedProducts({ count: 50 });
  };

  return <button onClick={func1}>seed products</button>;
}


export default test;