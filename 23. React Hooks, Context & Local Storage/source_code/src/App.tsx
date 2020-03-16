import React from "react";

import { DarkModeProvider } from "~/providers/DarkModeProvider";
import MainApp from "~/views/MainApp";

const App = () => {
  return (
    <DarkModeProvider>
      <MainApp />
    </DarkModeProvider>
  );
};

export default App;
