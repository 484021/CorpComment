const MAX_CHARS = 150;
const BASE_API_URL = "https://bytegrad.com/course-assets/js/1/api";

const textareaEl = document.querySelector(".form__textarea");
const counterEl = document.querySelector(".counter");
const formEl = document.querySelector(".form");
const feedbackListEl = document.querySelector('.feedbacks');
const submitBtnEl = document.querySelector('.submit-btn');
const spinnerEl = document.querySelector('.spinner');
const hashtagListEl = document.querySelector('.hashtags');

const renderFeedbackItem = (feedbackItem) => {
    // new feedback item


    const feedbackHTML = `
    <li class="feedback">
    <button class="upvote">
        <i class="fa-solid fa-caret-up upvote__icon"></i>
        <span class="upvote__count">${feedbackItem.upvoteCount}</span>
    </button>
    <section class="feedback__badge">
        <p class="feedback__letter">${feedbackItem.badgeLetter}</p>
    </section>
    <div class="feedback__content">
        <p class="feedback__company">${feedbackItem.company}</p>
        <p class="feedback__text">${feedbackItem.text}</p>
    </div>
    <p class="feedback__date">${feedbackItem.daysAgo === 0 ? 'NEW' : `${feedbackItem.daysAgo}d`}</p>
</li>
`;

    //insert to html

    feedbackListEl.insertAdjacentHTML('beforeend', feedbackHTML);
}

const inputHandler = () => {
    //determine maximum number of characters
    const maxNumChars = MAX_CHARS;
    
    //determine number of characters currently type
    const currentNumChars = textareaEl.value.length;

    //calc chars left
    const charsLeft = maxNumChars - currentNumChars;

    //manipulate counter

    counterEl.textContent = charsLeft;

}


textareaEl.addEventListener('input', inputHandler);


//create the form component
const showVisualIndicator = textCheck => {
    const className = textCheck === 'valid' ? 'form--valid' : 'form--invalid';
    formEl.classList.add(className)

    setTimeout(() => {
        formEl.classList.remove(className);

    } ,2000);
}

const submitHandler = event => {
    //prevent default browser action
    event.preventDefault();
    //get text from text area

    const text = textareaEl.value;

    //validate text (check for #, text length)

    if(text.includes('#') && text.length >= 5) {
        //show valid indicator
        showVisualIndicator('valid');
    } else {
        //show invalid indicator
        showVisualIndicator('invalid');
        //focus text area again
        textareaEl.focus();

        return;

    }

    //add to list
    const hashTag = (text.split(' ').find(element => element.includes('#')));    
    const company = hashTag.substring(1);
    const badgeLetter = company.substring(0,1).toUpperCase();
    const upvoteCount = 0;
    const daysAgo = 0;

    //create feeback item object
    const feedbackItem = {
        upvoteCount,
        company,
        badgeLetter,
        daysAgo,
        text
    };
    //render feedbackitem
    renderFeedbackItem(feedbackItem);

    //send feedbackitem to server
    fetch(`${BASE_API_URL}/feedbacks`, {
        method: 'POST',
        body: JSON.stringify(feedbackItem),
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        }
    }).then(response => {
        if(!response.ok) {
            console.log('something went wrong');
            return;
        }
            console.log('successfully submitted');
        
    }).catch(error => console.log(error));


    //clear text area
    textareaEl.value = '';

    //unfocus the submit
    submitBtnEl.blur();

    //reset counter
    counterEl.textContent = MAX_CHARS;
}

formEl.addEventListener('submit', submitHandler)


// -- feedback list component
const clickHandler = (event) => {
    const clickedEl = event.target;

    // upvote or expand
    const upvoteIntention = clickedEl.className.includes('upvote');

    if(upvoteIntention) {

        const upvoteBtnEl = clickedEl.closest('.upvote');

        //disable after being clicked
        upvoteBtnEl.disabled = true;

        //select the upvote element thats displaying the upvote amount
        const upvoteCountEl = upvoteBtnEl.querySelector('.upvote__count');

        //get currently displayed upvotes and increase then display
        let upvoteCount = +upvoteCountEl.textContent;

        upvoteCount++;

        upvoteCountEl.textContent = upvoteCount;
    } else {

        //expand
        clickedEl.closest('.feedback').classList.toggle('feedback--expand');
    }
};

feedbackListEl.addEventListener('click', clickHandler);


fetch(`${BASE_API_URL}/feedbacks`)
    .then(response => response.json())
    .then(data => {
    //remove spinner
        spinnerEl.remove();

    // iterate over each array in the json object and render it onto the list component
    data.feedbacks.forEach(feedbackItem => renderFeedbackItem(feedbackItem))
    })
    .catch(error => {
        feedbackListEl.textContent = `Failed to fetch feeback items. Error message: ${error.message}`;
    });

// --HASHTAGS list component--
const clickHandler2 = event => {
    const clickedEl = event.target;

    //stop function if click happens outside the button
    if(clickedEl.className === 'hashtags') return;

    const companyNameFromHastag = clickedEl.textContent.substring(1).toLowerCase().trim();
    console.log(companyNameFromHastag);

    //iterate throught all the feedback items in the list
    feedbackListEl.childNodes.forEach(childNode => {
        if(childNode.nodeType === 3) return;

        // extract company name
        const companyNameFromFeedbackItem = childNode.querySelector('.feedback__company').textContent.toLowerCase().trim();

        //remove all other feedbacks in the list if its not the same company name as selected by the user and that we seperated ^
        if (companyNameFromHastag !== companyNameFromFeedbackItem) {
            childNode.remove();
        }
    });
};

hashtagListEl.addEventListener('click', clickHandler2); 