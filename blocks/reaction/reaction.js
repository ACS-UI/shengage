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
    return data;
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
 * Renders the reaction elements with the appropriate data
 * @param {HTMLElement} block - The container element for the reaction icons
 * @param {Array} reactionData - The data for the reactions
 */
function renderReactionElements(block, reactionData) {
  const reactions = block.querySelectorAll('.reaction-container div:nth-child(2) > div p');

  reactions.forEach((reaction) => {
    const reactionIcon = reaction.querySelector('img').dataset.iconName;
    const matchedData = reactionData?.find((data) => data.name === reactionIcon);
    if (matchedData?.isReactedByCurrentUser) {
      reaction.classList.add('active');
    }
    let reactionCount = reaction.querySelector('.reaction-count');
    if (!reactionCount) {
      reactionCount = document.createElement('span');
      reactionCount.className = 'reaction-count';
      reaction.appendChild(reactionCount);
    }
    reaction.setAttribute('data-action-count', matchedData ? matchedData.count : 0);
    reactionCount.innerHTML = matchedData ? matchedData.count : 0;
  });
}

/**
 * Binds event listeners to the reaction elements
 * @param {HTMLElement} block - The container element for the reaction icons
 */
function bindReactionEvents(block) {
  const reactions = block.querySelectorAll('.reaction-container div:nth-child(2) > div p');

  reactions.forEach((reaction) => {
    const reactionIcon = reaction.querySelector('img').dataset.iconName;

    reaction.addEventListener('click', async (e) => {
      if (!isSignedIn) {
        return promptUserSignIn(block);
      }
      const element = e.target.tagName === 'P' ? e.target : e.target.closest('p');
      const count = element.dataset.actionCount;
      const activeElement = block.querySelector('.reaction-container .active');
      const activeCount = activeElement?.dataset.actionCount;
      const activeReactionIcon = activeElement?.querySelector('img').dataset.iconName;
      if (reactionIcon === activeReactionIcon) {
        return true;
      }
      if (activeCount) {
        activeElement.setAttribute('data-action-count', parseInt(activeCount, 10) - 1);
        activeElement.querySelector('.reaction-count').textContent = parseInt(activeCount, 10) - 1;
        element.setAttribute('data-action-count', parseInt(count, 10) + 1);
        element.querySelector('.reaction-count').textContent = parseInt(count, 10) + 1;
      } else {
        element.setAttribute('data-action-count', parseInt(count, 10) + 1);
        element.querySelector('.reaction-count').textContent = parseInt(count, 10) + 1;
      }
      // Update active state
      reactions.forEach((icon) => icon.classList.remove('active'));
      reaction.classList.add('active');
      // Handle the reaction
      await handleReaction(reactionIcon);
      return true;
    });
  });
}

/**
 * Initializes the reaction block by setting up UI state and event listeners
 * @param {HTMLElement} block - The container element for the reaction icons
 */
async function initReaction(block) {
  if (isSignedIn) {
    userDetails = await getUserData();
  }
  const reactionData = await handleReaction();

  renderReactionElements(block, reactionData);
  bindReactionEvents(block);
}

/**
 * Loads and decorates the reaction block with user-specific data
 * @param {HTMLElement} block - The reaction block element
 */
export default async function decorate(block) {
  isSignedIn = await isSignedInUser();
  initReaction(block);
}
