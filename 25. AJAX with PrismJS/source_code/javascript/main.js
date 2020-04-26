function onPaste() {
  const editable = document.getElementById("editable");
  const dockerCompose = editable.innerText;
  editable.innerHTML = '<code id="yaml" class="language-yaml"></code>';
  const yaml = document.getElementById("yaml");
  yaml.innerHTML = Prism.highlight(dockerCompose, Prism.languages.yaml, "yaml");
}
