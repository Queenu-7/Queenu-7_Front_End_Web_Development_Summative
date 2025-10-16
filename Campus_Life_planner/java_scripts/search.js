export function safeRegexCompile(pattern, flags = 'i') {
    if (!pattern || pattern.trim() === '') {
        return null;
    }

    try {
        return new RegExp(pattern, flags);
    } catch (error) {
        console.warn('Invalid regex pattern:', pattern, error);
        return null;
    }
}

export function highlightMatches(text, regex) {
    if (!regex || !text) return text;

    return text.replace(regex, match => `<mark>${match}</mark>`);
}

export function searchTasks(tasks, searchTerm, fields = ['title', 'tag']) {
    if (!searchTerm || searchTerm.trim() === '') {
        return tasks;
    }

    const regex = safeRegexCompile(searchTerm);
    if (!regex) {
        //If regex is invalid, fall back to simple text search
        const lowerSearch = searchTerm.toLowerCase();
        return tasks.filter(task =>
            fields.some(field =>
                String(task[field]).toLowerCase().includes(lowerSearch)
            )

        );
    }

    return tasks.filter(task =>
        fields.some(field => regex.test(task[field]))

    );
}

//Advanced search patterns for specific use cases

export const searchPatterns = {
    // search by tag prefix
    tagSearch: (tag) => `^${tag}$|\\b${tag}\\b`,

    // search for tasks with duration greater than x minutes
    durationGreaterThan: (minutes) => `\\b([1-9]\\d{2,}|[6-9]\\d)\\b`,
    //Rough pattern for > 60 minutes

    // search for specific date patterns
    dateThisWeek: () => {
        const today = new Date();
        const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        return `2025-${String(weekFromNow.getMonth() + 1).padStart(2, '0')}-(0[1-9]|[12]\\d|3[01])`;
    },

    //find tasks with time mentions in title
    findTimeMentions: () => `\\b\\d{2}\\s*(?:AM|PM)?\\b|\\b\\d{1,2}\\s*(?:hours?|hrs?|minutes?|mins?)\\b`
};

//search suggestions helper

export function getSearchSuggestions(tasks) {
    const suggestions = {
        tags: [...new Set(tasks.map(task => task.tag))],
        commonWords: getCommonWords(tasks.map(task => task.title))
    };

    return suggestions;
}

function getCommonWords(titles) {
    const words = titles.flatMap(title =>
        title.toLowerCase().split(/\s+/).filter(word => word.length > 3)
    );

    const wordCount = {};
    words.forEach(word => {
        wordCount[word] = (wordCount[word] || 0) + 1;
    });

    return Object.entries(wordCount)
    .sort(([, a], [, b]) => b-a)
    .slice(0,10)
    .map(([word]) => word);
}
