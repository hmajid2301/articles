function reRunPrismJS() {
  const yamlEditable = document.getElementById("editable");
  const dockerCompose = yamlEditable.innerText;
  yamlEditable.innerHTML = "";
  yamlEditable.innerHTML += '<code id="yaml" class="language-yaml"></code>';
  const yaml = document.getElementById("yaml");
  yaml.innerHTML = Prism.highlight(dockerCompose, Prism.languages.yaml, "yaml");
}
