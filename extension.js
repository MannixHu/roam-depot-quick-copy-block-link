

const onQuickCopyDesktopMDLink = async (block) => {
  let blockText = "";
  let blockId = "";
  const graphName = window.roamAlphaAPI.graph.name;
  if (block) {
    // trigger: right click menu
    blockText = block?.["block-string"];
    blockId = block?.["block-uid"];
  } else {
    // trigger: current focused block
    const blockInfo =  await window.roamAlphaAPI.ui.getFocusedBlock()
    blockId = blockInfo?.["block-uid"];
    if(!blockId) {
      // trigger: current page
      blockId = await window.roamAlphaAPI.ui.mainWindow.getOpenPageOrBlockUid()
    }
    const blockFocused = window.roamAlphaAPI.data.pull("[*]", [":block/uid", blockId])
    blockText = blockFocused?.[":block/string"] || blockFocused?.[":node/title"];
  }

  const title = escapeTitle(blockText);
  const url = `roam://#/app/${graphName}/page/${blockId}`;
  
  // Multiple link format options
  const linkFormats = {
    
    // Markdown format link
    markdown: `[${title}](${url})`,
    
    // HTML format link
    html: `<a href="${url}">${title}</a>`,
  
  };

  // Copy as rich text format for easy pasting as clickable links in Word
  const htmlText = linkFormats.html;
  const plainText = linkFormats.markdown; // Use markdown format for plain text
  
  // Use write method to support multiple formats
  const clipboardItem = new ClipboardItem({
    'text/html': new Blob([htmlText], { type: 'text/html' }),
    'text/plain': new Blob([plainText], { type: 'text/plain' })
  });
  
  await navigator.clipboard.write([clipboardItem]);
}

// escape title
const escapeTitle = (title) => {
  if(!title) return ' '
  // Remove double brackets {{[[TODO]]}} and their content
  title = title.replace(/{{.*?}}/g, '');
  // Remove paired [] brackets, keep content inside
  title = title.replace(/\[(.*?)\]/g, ' $1 ')
  // Remove paired `` backticks, keep content inside
  title = title.replace(/`(.*?)`/g, ' $1 ')
  return title
}

async function onload({extensionAPI, ...rest}) {

  // right click menu
  await window.roamAlphaAPI.ui.blockContextMenu.addCommand({
		label: "copy desktop link as markdown",
		callback: onQuickCopyDesktopMDLink,
	});

  // shortcut
  extensionAPI.ui.commandPalette.addCommand({
    label: "copy desktop link as markdown",
    callback: onQuickCopyDesktopMDLink,
  });

}

async function onunload() {
  console.log("Unloaded Settings Panel Example");
}

export default {
  onload: onload,
  onunload: onunload
};