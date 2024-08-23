/*
 * Reaction Block
 * Handles user reactions, including fetching, submitting, and updating reactions
 */
import { htmlToElement, apiRequest } from '../../scripts/scripts.js';
import { isSignedInUser, getUserData } from '../../scripts/profile.js';

let reaction = {};
let userDetails = {};
let isSignedIn = false;
const config = {};

/**
 * Submits or fetches the reaction based on the current state of `reaction`
 * @returns {Promise<void>}
 */
async function handleReaction() {
  const postData = {
    story_id: config.storyId,
    user_id: userDetails.id,
    ...(reaction && { reaction }),
  };
  const endpoint = reaction ? '/submitReaction' : '/getReactions';
  try {
    const { payload } = await apiRequest({
      method: 'POST',
      endpoint,
      data: postData,
    });
    if (!reaction) {
      reaction = payload?.reaction_name || '';
    }
    console.log(reaction ? 'Reaction submitted' : 'Reaction fetched:', reaction || payload);
  } catch (error) {
    console.error('Error handling reaction:', error);
  }
}

/**
 * Initializes the reaction block by setting up event listeners and UI state
 * @param {HTMLElement} block - The container element for the reaction icons
 * @returns {Promise<void>}
 */
async function initReaction(block) {
  const reactionIcons = block.querySelectorAll('.reaction-container div:nth-child(2) > div p');
  const userReaction = userDetails.id ? reaction.reaction_name : '';
  reactionIcons.forEach((reactionIcon) => {
    const selectedReaction = reactionIcon.querySelector('img').getAttribute('data-icon-name');
    if (selectedReaction === userReaction) {
      reactionIcon.classList.add('active');
    }

    // Set up a click event listener for each reaction icon
    reactionIcon.addEventListener('click', async () => {
      if (isSignedIn) {
        // Activate the clicked icon
        reactionIcon.classList.add('active');
        await handleReaction(selectedReaction);
      } else {
        const reactionContainer = block.querySelector('.reaction-container div:nth-child(2)');
        if (!reactionContainer.querySelector('.info')) {
          reactionContainer.appendChild(htmlToElement('<div class="info"> <span> Looks like youre trying to react 🧐 ... Please <a href="/"> Login </a> </span> </div>'));
          reactionContainer.querySelector('.info a').addEventListener('click', (e) => {
            e.preventDefault();
            if (!isSignedIn) {
              window.adobeIMS.signIn();
            }
          });
        }
      }
    });
  });
}

/**
 * Loads and decorates the reaction block with user-specific data
 * @param {Element} block - The reaction block element
 */
export default async function decorate(block) {
  isSignedIn = await isSignedInUser();
  if (!isSignedIn) {
    initReaction(block);
    return;
  }
  userDetails = await getUserData() || [];
  reaction = await handleReaction();
  config.storyId = document.querySelector('meta[name="storyid"]')?.content;
  initReaction(block);
}
