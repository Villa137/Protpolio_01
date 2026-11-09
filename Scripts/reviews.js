(function () {
    var STORE = 'villa-portfolio-reviews';
    var counter = 0;

    function load() {
        try { return JSON.parse(localStorage.getItem(STORE)) || {}; }
        catch (e) { return {}; }
    }
    function save(data) {
        localStorage.setItem(STORE, JSON.stringify(data));
    }
    function esc(s) {
        var d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML;
    }
    function starText(n) {
        n = Math.round(n);
        return '★'.repeat(n) + '☆'.repeat(5 - n);
    }

    function render(slot) {
        var key = slot.getAttribute('data-key');
        var id = 'rv' + (++counter);
        var list = load()[key] || [];
        var count = list.length;
        var avg = count ? list.reduce(function (a, r) { return a + r.rating; }, 0) / count : 0;

        var radios = '';
        for (var i = 5; i >= 1; i--) {
            radios += '<input type="radio" id="' + id + '-' + i + '" name="' + id + '" value="' + i + '">' +
                      '<label for="' + id + '-' + i + '" title="' + i + ' star' + (i > 1 ? 's' : '') + '">★</label>';
        }

        var items = list.slice().reverse().slice(0, 20).map(function (r) {
            return '<li>' +
                '<div class="rv-head"><strong>' + esc(r.name) + '</strong>' +
                '<span class="rv-stars rv-small">' + starText(r.rating) + '</span>' +
                '<time>' + esc(r.date) + '</time></div>' +
                '<p>' + esc(r.comment) + '</p></li>';
        }).join('');

        slot.innerHTML =
            '<div class="rv-summary">' +
                '<span class="rv-stars" title="' + avg.toFixed(1) + ' out of 5">' + starText(avg) + '</span><br>' +
                '<span class="rv-muted">' + (count ? avg.toFixed(1) + ' · ' : '') +
                count + ' review' + (count === 1 ? '' : 's') + '</span>' +
            '</div>' +
            (count ? '<ul class="rv-list">' + items + '</ul>' : '') +
            '<details>' +
                '<summary>Write a review</summary>' +
                '<form class="rv-form">' +
                    '<div class="rv-stars-input" role="radiogroup" aria-label="Rating">' + radios + '</div>' +
                    '<input type="text" name="author" maxlength="60" placeholder="Your name">' +
                    '<textarea name="comment" maxlength="500" rows="3" placeholder="What do you think?"></textarea>' +
                    '<button type="submit" class="rv-btn">Post review</button>' +
                    '<p class="rv-notice"></p>' +
                '</form>' +
            '</details>';

        var form = slot.querySelector('form');
        var notice = slot.querySelector('.rv-notice');
        var details = slot.querySelector('details');

        form.addEventListener('submit', function (ev) {
            ev.preventDefault();
            var checked = form.querySelector('input[type=radio]:checked');
            var author = form.elements.author.value.trim();
            var comment = form.elements.comment.value.trim();

            if (!checked || !author || !comment) {
                notice.textContent = 'Please pick a star rating and fill in your name and review.';
                return;
            }

            var all = load();
            all[key] = all[key] || [];
            all[key].push({
                name: author.slice(0, 60),
                rating: parseInt(checked.value, 10),
                comment: comment.slice(0, 500),
                date: new Date().toISOString().slice(0, 10)
            });
            save(all);
            render(slot);
            slot.querySelector('details').open = true;
            slot.querySelector('.rv-notice').textContent = '';
            var thanks = document.createElement('p');
            thanks.className = 'rv-thanks';
            thanks.textContent = 'Thanks! Your review was posted.';
            slot.querySelector('.rv-summary').after(thanks);
        });
    }

    document.querySelectorAll('.review-slot').forEach(render);
})();