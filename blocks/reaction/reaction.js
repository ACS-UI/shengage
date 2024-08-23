/*
 * Reaction Block
 * Handles user reactions, including fetching, submitting, and updating reactions
 */
import { htmlToElement } from '../../scripts/scripts.js';
import { isSignedInUser, getUserData } from '../../scripts/profile.js';

let reaction = {};
let userDetails = {};
let isSignedIn = false;
const config = {
  apiEndpoint: 'http://localhost:8080', // API endpoint for submitting and fetching reactions
};

/**
 * Submits the user's reaction to the server
 */
async function submitReaction() {
  try {
    const response = await fetch(`${config.apiEndpoint}/postReaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: config.storyId, data: reaction }),
    });
    const data = await response.json();
    console.log('Success:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Fetches reactions from the server
 * @returns {Object|null} The fetched reaction data or null in case of an error
 */
async function getReaction() {
  try {
    const response = await fetch(`${config.apiEndpoint}/getReactions`);
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const data = await response.json();
    return data.data || {};
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}

/**
 * Finds the category of a user's reaction
 * @param {Object} obj - The object containing reaction data
 * @param {string} userId - The ID of the user
 * @returns {string|null} The category the user reacted to or null if not found
 */
const findUserCategory = (obj, userId) => {
  const key = Object.keys(obj).find(
    (k) => Array.isArray(obj[k]) && obj[k].includes(userId),
  );
  return key || null;
};

async function initReaction(block) {
  const icons = block.querySelectorAll('.reaction-container div:nth-child(2) > div p');
  const userCategory = findUserCategory(reaction, userDetails.id);
  icons.forEach((icon) => {
    const iconCategory = icon.querySelector('img').getAttribute('data-icon-name');

    if (iconCategory === userCategory) {
      icon.classList.add('active');
    }

    icon.addEventListener('click', async () => {
      isSignedIn = await isSignedInUser();
      if (isSignedIn) {
        await getUserData();
        // Remove 'active' class from all icons
        icons.forEach((i) => i.classList.remove('active'));
        // Update the reaction object
        if (reaction[iconCategory]) {
          reaction[iconCategory].push(userDetails.id);
        } else {
          reaction[iconCategory] = [userDetails.id];
        }
        // Remove user ID from other categories
        Object.keys(reaction).forEach((category) => {
          if (category !== iconCategory) {
            reaction[category] = reaction[category].filter((id) => id !== userDetails.id);
          }
        });
        // Activate the clicked icon
        icon.classList.add('active');
        await submitReaction();
      } else {
        const reactionContainer = block.querySelector('.reaction-container div:nth-child(2)');
        if (!reactionContainer.querySelector('.info')) {
          reactionContainer.appendChild(htmlToElement('<div class="info"> <span> Please Login to react ... <a href="/"> Login </a> </span> </div>'));
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
  reaction = await getReaction();
  config.storyId = document.querySelector('meta[name="storyid"]')?.content;
  initReaction(block);
}
