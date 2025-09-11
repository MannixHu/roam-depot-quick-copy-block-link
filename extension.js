const getBlockByRightClick = (block) => {
  // right click menu trigger
  return {
    text: block?.["block-string"],
    uid: block?.["block-uid"],
  }
}

const getBlockTextByUID = (uid) => {
  const block = window.roamAlphaAPI.data.pull("[*]", [":block/uid", uid])
  const text = block?.[":block/string"] || block?.[":node/title"];
  return text
}

const  getValidBlockUID = async () => {
  let uid 
  // current focused block trigger
  const blockInfo =  await window.roamAlphaAPI.ui.getFocusedBlock()
  uid = blockInfo?.["block-uid"];
  if(!uid) {
    // current page trigger
    uid = await window.roamAlphaAPI.ui.mainWindow.getOpenPageOrBlockUid()
  }
  return uid
}

const getClipboardItem = (text, uid) => {
  const title = escapeTitle(text);
  const graphName = window.roamAlphaAPI.graph.name;
  const url = `roam://#/app/${graphName}/page/${uid}`;
  
  // Multiple link format options
  const linkFormats = {
    // Markdown format link
    markdown: `[${title}](${url})`,
    // HTML format link
    html: `<a href="${url}">${title}</a>`,
  };
  // Use write method to support multiple formats
  const clipboardItem = new ClipboardItem({
    'text/html': new Blob([linkFormats.html], { type: 'text/html' }),
    'text/plain': new Blob([linkFormats.markdown], { type: 'text/plain' })
  });
  return clipboardItem
}


const onQuickCopyDesktopMDLink = async (block) => {
  let text = "";
  let uid = "";
  
  if (block) {
    ({text, uid} = getBlockByRightClick(block))
  } else {
    uid = await getValidBlockUID()
    text = getBlockTextByUID(uid);
  }

  const clipboardItem = getClipboardItem(text, uid);
  
  await navigator.clipboard.write([clipboardItem]);
}


// escape title
const escapeTitle = (title) => {
  if(!title) return ' '
  
  // Remove double brackets {{[[TODO]]}} and their content
  title = title.replace(/{{.*?}}/g, '');
  
  // Extract content from [[aa]] page references, keep only 'aa'
  title = title.replace(/\[\[(.*?)\]\]/g, '$1');
  
  // Extract content from [aa](xx) markdown links, keep only 'aa'
  title = title.replace(/\[(.*?)\]\([^)]*\)/g, '$1');
  
  // Extract content from **aa** bold text, keep only 'aa'
  title = title.replace(/\*\*(.*?)\*\*/g, '$1');
  
  // Extract content from ^^aa^^ highlights, keep only 'aa'
  title = title.replace(/\^\^(.*?)\^\^/g, '$1');
  
  // Remove paired [] brackets, keep content inside (fallback for other bracket patterns)
  title = title.replace(/\[(.*?)\]/g, '$1');
  
  // Remove paired `` backticks, keep content inside
  title = title.replace(/`(.*?)`/g, '$1');

  
  return title || ' ';
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