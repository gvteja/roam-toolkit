import {delay} from 'src/core/common/async'
import {Mode, nmap, nvmap, returnToNormalMode, RoamVim} from 'src/core/features/vim-mode/vim'
import {insertBlockAfter} from 'src/core/features/vim-mode/commands/insert-commands'
import {Roam} from 'src/core/roam/roam'
import {copyBlockEmbed, copyBlockReference} from 'src/core/roam/block'
import {VimRoamPanel} from 'src/core/features/vim-mode/roam/roam-vim-panel'
import {RoamBlock} from 'src/core/features/vim-mode/roam/roam-block'

const cutAndGoBackToNormal = async () => {
    document.execCommand('cut')
    // Wait for the block to disappear, double check that a block is still selected
    // Deleting the first line can lead to no previous block existing to select
    await delay(0)
    await returnToNormalMode()
}

const paste = async () => {
    await insertBlockAfter()
    document.execCommand('paste')
    await returnToNormalMode()
}

const pasteBefore = async () => {
    await RoamVim.jumpBlocksInFocusedPanel(-1)
    await insertBlockAfter()
    document.execCommand('paste')
    await returnToNormalMode()
}

const copySelectedBlock = async (mode: Mode) => {
    if (mode === Mode.NORMAL) {
        await Roam.highlight(RoamBlock.selected().element)
    }
    document.execCommand('copy')
    await returnToNormalMode()
}

const copySelectedBlockReference = () => copyBlockReference(VimRoamPanel.selected().selectedBlock().id)

const copySelectedBlockEmbed = () => copyBlockEmbed(VimRoamPanel.selected().selectedBlock().id)

const enterOrCutInVisualMode = async (mode: Mode) => {
    if (mode === Mode.NORMAL) {
        return Roam.highlight(RoamBlock.selected().element)
    }
    await cutAndGoBackToNormal()
}

export const ClipboardCommands = [
    nmap('p', 'Paste', paste),
    nmap('shift+p', 'Paste Before', pasteBefore),
    nvmap('y', 'Copy', copySelectedBlock),
    nvmap('c', 'Copy Block Reference', copySelectedBlockReference),
    nvmap('shift+y', 'Copy Block Embed', copySelectedBlockEmbed),
    // mapping 'd d' and 'd' conflict with each other.
    // replicate the behavior of `d d` by entering visual, and then cutting
    // this gives more feedback in the UX anyways
    nvmap('d', 'Enter Visual Mode / Cut in Visual Mode', enterOrCutInVisualMode),
]
