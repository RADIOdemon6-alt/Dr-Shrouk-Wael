
function switchCard(cardId) {
    document.querySelectorAll('.form-card').forEach(card => {
        card.classList.remove('active');
        card.classList.add('hidden');
    });
    const targetCard = document.getElementById(cardId);
    targetCard.classList.remove('hidden');
    targetCard.classList.add('active');
    targetCard.classList.add('glitch');
    setTimeout(() => {
        targetCard.classList.remove('glitch');
    }, 300);
}
