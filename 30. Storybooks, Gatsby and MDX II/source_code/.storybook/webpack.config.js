module.exports = ({ config }) => {
  config.module.rules[0].use[0].loader = require.resolve("babel-loader");
  config.module.rules[0].use[0].options.presets = [
    require.resolve("@babel/preset-react"),
    require.resolve("@babel/preset-env"),
  ];

  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    loader: require.resolve("babel-loader"),
    options: {
      presets: [["react-app", { flow: false, typescript: true }]],
      plugins: [],
    },
  });

  config.module.rules.push({
    test: /\.css$/,
    use: [
      {
        loader: "postcss-loader",
        options: {
          sourceMap: true,
          config: {
            path: "./.storybook/",
          },
        },
      },
    ],
  });

  return config;
};
