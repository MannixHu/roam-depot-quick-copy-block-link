

const onQuickCopyDesktopMDLink = async (block) => {
  let blockText = "";
  let blockId = "";
  if (block) {
    // triggle: right click menu
    blockText = block?.["block-string"];
    blockId = block?.["block-uid"];
  } else {
    // triggle: current focused block
    const blockInfo =  await window.roamAlphaAPI.ui.getFocusedBlock()
    blockId = blockInfo?.["block-uid"];
    if(!blockId) {
      // triggle: current page
      blockId = await window.roamAlphaAPI.ui.mainWindow.getOpenPageOrBlockUid()
    }
    const blockFocused = window.roamAlphaAPI.data.pull("[*]", [":block/uid", blockId])
    console.log('blockFocused ', blockFocused)
    blockText = blockFocused?.[":block/string"] || blockFocused?.[":node/title"];
  }

  const text = `[${blockText}](roam://#/app/MannixHu/page/${blockId})`
  console.log("copy desktop link as markdown : ", text);
  await navigator.clipboard.writeText(text)

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