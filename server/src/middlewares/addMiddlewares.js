import addEnvironmentMiddlewares from "./addEnvironmentMiddlewares.js";
import addExpressSession from "./addExpressSession.js";

const addMiddlewares = async app => {
  addExpressSession(app);
  await addEnvironmentMiddlewares(app);
};

export default addMiddlewares;
