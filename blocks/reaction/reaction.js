/*
 * Reaction Block
 * Handles user reactions, including fetching, submitting, and updating reactions
 */
import { htmlToElement, apiRequest } from '../../scripts/scripts.js';
import { isSignedInUser, getUserData } from '../../scripts/auth.js';

let userDetails = {};
let isSignedIn = false;

/**
 * Submits or fetches the reaction based on the current state of `reaction`
 * @param {string|null} reaction - The reaction to submit, or null to fetch existing reactions
 * @returns {Promise<string|null>} The name of the reaction or null if not found
 */
async function handleReaction(reaction = null) {
  const endpoint = reaction ? '/postReaction' : '/getReactions';
  const storyId = document.querySelector('meta[name="storyid"]')?.content;

  try {
    const { data } = await apiRequest({
      method: 'POST',
      endpoint,
      data: {
        storyId,
        userId: userDetails.id,
        ...(reaction && { reaction }),
      },
    });
    // console.log(`${reaction ? 'Reaction submitted' : 'Reaction fetched'}:`, reaction );
    return data?.reaction_name ?? null;
  } catch (error) {
    console.error('Error handling reaction:', error);
    return null; // Fallback value in case of an error
  }
}

/**
 * Prompts the user to sign in when attempting to react without being signed in
 * @param {HTMLElement} block - The container element for the reaction icons
 */
function promptUserSignIn(block) {
  const reactionContainer = block.querySelector('.reaction-container div:nth-child(2)');
  if (!reactionContainer.querySelector('.info')) {
    reactionContainer.appendChild(htmlToElement(`
      <div class="info">
        <span>Looks like you're trying to react 🧐 ... Please <a href="/">Login</a></span>
      </div>
    `));
    reactionContainer.querySelector('.info a').addEventListener('click', (e) => {
      e.preventDefault();
      if (!isSignedIn) {
        window.adobeIMS.signIn();
      }
    });
  }
}

/**
 * Initializes the reaction block by setting up event listeners and UI state
 * @param {HTMLElement} block - The container element for the reaction icons
 */
async function initReaction(block) {
  if (isSignedIn) {
    userDetails = await getUserData();
  }

  const reactionIcons = block.querySelectorAll('.reaction-container div:nth-child(2) > div p');
  const userReaction = await handleReaction();

  reactionIcons.forEach((reactionIcon) => {
    const reaction = reactionIcon.querySelector('img').dataset.iconName;
    if (reaction === userReaction) {
      reactionIcon.classList.add('active');
    }
    const reactionCount = document.createElement('span');
    reactionCount.className = 'reaction-count';
    reactionCount.innerHTML = '23';
    reactionIcon.appendChild(reactionCount);

    reactionIcon.addEventListener('click', async () => {
      if (!isSignedIn) {
        return promptUserSignIn(block);
      }

      reactionIcons.forEach((icon) => icon.classList.remove('active'));
      reactionIcon.classList.add('active');
      await handleReaction(reaction);
      return true;
    });
  });
}

/**
 * Loads and decorates the reaction block with user-specific data
 * @param {HTMLElement} block - The reaction block element
 */
export default async function decorate(block) {
  isSignedIn = await isSignedInUser();
  initReaction(block);
}
