/*
 * Reaction Block
 * Collects the user's reaction
 */
import { htmlToElement } from '../../scripts/scripts.js';

let comments = [];
let userDetails = {};
let parentId;
let currentOpenReplyForm = null;

function getUserData() {
  // user details
  return {
    id: 'UR001',
    name: 'Karvannan',
    avatar: '../assets/profile.png',
  };
}

async function getCommentData() {
  const apiUrl = 'http://localhost:8080/read';
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}

function getIndianTimestamp() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  return new Date(now.getTime() + istOffset);
}

function prepareData(commentText, currentLevel = 0) {
  const storryId = document.querySelector('meta[name="storryid"]')?.getAttribute('content');
  const commentId = currentLevel === 0 ? `${parseInt(parentId, 10) + 1}` : `${parentId}.${currentLevel + 1}`;
  return {
    storryId,
    commentId,
    commentText,
    postedBy: userDetails,
    postedDate: getIndianTimestamp(),
  };
}

const formatRelativeTime = (timestamp) => {
  const difference = Date.now() - new Date(timestamp).getTime();

  const timeUnits = [
    { unit: 'year', value: 365 * 24 * 60 * 60 * 1000 },
    { unit: 'month', value: 30 * 24 * 60 * 60 * 1000 },
    { unit: 'week', value: 7 * 24 * 60 * 60 * 1000 },
    { unit: 'day', value: 24 * 60 * 60 * 1000 },
    { unit: 'hour', value: 60 * 60 * 1000 },
    { unit: 'minute', value: 60 * 1000 },
    { unit: 'second', value: 1000 },
  ];

  const timeUnit = timeUnits.find(({ value }) => Math.floor(difference / value) >= 1);

  if (timeUnit) {
    const time = Math.floor(difference / timeUnit.value);
    return `${time} ${timeUnit.unit}${time > 1 ? 's' : ''} ago`;
  }

  return 'just now';
};

function triggerApiCall() {
  // Example API call:
  fetch('http://localhost:8080/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(comments),
  })
    .then((response) => response.json())
    .then((data) => console.log('Success:', data))
    .catch((error) => console.error('Error:', error));
}

function createCommentHtml(data) {
  const repliesHtml = data.reply ? data.reply.map(createCommentHtml).join('') : '';
  return `
    <div class="comment-items" id="${data.commentId}">
      <div class="comment-item">
        <img src="${data.postedBy.avatar}" alt="${data.postedBy.name}" class="avatar">
        <div class="comment-body">
          <h3 class="author">${data.postedBy.name} <span class="date">${formatRelativeTime(data.postedDate)}</span></h3>
          <p>${data.commentText}</p>
          <div class="comment-actions">
            <button>Like</button>
            <button class="reply-button" data-comment-id="${data.commentId}">Reply</button>
          </div>
          <div class="reply-form" id="reply-form-${data.commentId}">
            <textarea placeholder="Write a reply..."></textarea>
            <button class="post-comment submit-reply-button" data-comment-id="${data.commentId}">Reply</button>
          </div>
        </div>
      </div>
      <div class="comment-replies">
        ${repliesHtml}
      </div>
    </div>
  `;
}

function toggleReplyForm(commentId) {
  const replyForm = document.getElementById(`reply-form-${commentId}`);

  if (currentOpenReplyForm && currentOpenReplyForm !== replyForm) {
    // Close the currently open reply form
    currentOpenReplyForm.style.display = 'none';
  }

  // Toggle the visibility of the clicked reply form
  if (replyForm.style.display === 'none' || !replyForm.style.display) {
    replyForm.style.display = 'block';
    currentOpenReplyForm = replyForm;
  } else {
    replyForm.style.display = 'none';
    currentOpenReplyForm = null;
  }
}

// Function to submit a reply
function submitReply(commentId) {
  const replyForm = document.getElementById(`reply-form-${commentId}`);
  const textarea = replyForm.querySelector('textarea');
  const replyText = textarea.value.trim();
  if (replyText) {
    alert(`Reply: ${replyText}`);
    textarea.value = ''; // Clear the textarea
    replyForm.style.display = 'none'; // Hide the reply form
    currentOpenReplyForm = null; // Reset the currently open reply form tracker
  }
}

// Function to handle event delegation
function handleEventDelegation(event) {
  if (event.target && event.target.classList.contains('reply-button')) {
    const commentId = event.target.getAttribute('data-comment-id');
    toggleReplyForm(commentId);
  } else if (event.target && event.target.classList.contains('submit-reply-button')) {
    const commentId = event.target.getAttribute('data-comment-id');
    submitReply(commentId);
  }
}

export default async function decorate(block) {
  userDetails = await getUserData();
  comments = await getCommentData();

  const commentContainer = htmlToElement(`
    <div class="comment-area">
        <div class="comment-input">
            <img src="${userDetails.avatar}" alt="Avatar" class="avatar">
            <textarea id="commentText" rows="5" placeholder="What are your thoughts?"></textarea>
        </div>
        <div class="comment-actions right">
          <button class="post-comment" id="postComment">Post a comment</button>
        </div>
        <div id="commentsSection"></div>
    </div>
  `);

  block.innerHTML = '';
  block.appendChild(commentContainer);
  const commentsSectionDiv = block.querySelector('#commentsSection');
  commentsSectionDiv.innerHTML = comments.map(createCommentHtml).join('');
  commentsSectionDiv.addEventListener('click', handleEventDelegation);

  block.querySelector('#postComment').addEventListener('click', () => {
    const commentText = block.querySelector('#commentText').value.trim();
    parentId = comments.length > 0
      ? Math.max(...comments.map((comment) => parseInt(comment.commentId, 10))) : 1;

    if (!commentText) return;

    const data = prepareData(commentText);
    if (!data.storryId) return;
    comments.push(data);
    triggerApiCall(data);
    commentsSectionDiv.innerHTML = comments.map(createCommentHtml).join('');
    commentsSectionDiv.addEventListener('click', handleEventDelegation);
    block.querySelector('#commentText').value = '';
  });
}
