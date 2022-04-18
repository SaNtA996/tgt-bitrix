var CustomLeadKanban = BX.namespace('CustomLeadKanban');
var countConv = 19;
var countProgress = 19;
var countInProcess = 19;
CustomLeadKanban.modKanbanTimer = function () {
    if (CustomLeadKanban.leadTimer > 0) {
        return;
    }

    CustomLeadKanban.leadTimer = setInterval(
        function () {
            let kanbanGrid = BX.findChildByClassName(document, 'main-kanban-grid', true);
            if (kanbanGrid) {
                let kanbanColumn = BX.findChildrenByClassName(kanbanGrid, 'main-kanban-column', true);
                if (kanbanColumn.length != 0) {
                    // clearInterval(CustomLeadKanban.leadTimer);
                    // CustomLeadKanban.leadTimer = 0;
                    CustomLeadKanban.modKanbanLead(kanbanGrid);
                }
            }
        },
        100
    );
}
CustomLeadKanban.modKanbanItemTimer = function () {
    if (CustomLeadKanban.leadItemTimer > 0) {
        return;
    }

    CustomLeadKanban.leadItemTimer = setInterval(
        function () {
            var mainKanbanDiv = BX.findChildByClassName(document, 'main-kanban', true);
            if (mainKanbanDiv) {
                clearInterval(CustomLeadKanban.leadItemTimer);
                CustomLeadKanban.leadItemTimer = 0;
                CustomLeadKanban.modKanBanCard();
            }
        },
        100
    );
}

CustomLeadKanban.modKanBanCard = async function () {
    var test = 1;
    // var kanbanCards = BX.findChildrenByClassName(document, 'main-kanban-item', true);
    let cards = [];
    // console.log('test');
    let kanbanColumn = BX.findChildrenByClassName(document, 'main-kanban-column-body', true);
    if (kanbanColumn.length != 0) {
        for (let itemCards in kanbanColumn) {
            var kanbanCards = BX.findChildrenByClassName(kanbanColumn[itemCards], 'main-kanban-item', true);
            for (var cardIndex in kanbanCards) {
                cards[kanbanCards[cardIndex].attributes["data-id"].value] = kanbanCards[cardIndex];
                var tagsCircle = BX.findChildByClassName(kanbanCards[cardIndex], 'circleComment', true);
                if (!tagsCircle) {
                    BX.rest.callMethod("crm.timeline.comment.list", {
                        filter: {
                            'ENTITY_ID': kanbanCards[cardIndex].attributes["data-id"].value,
                            'ENTITY_TYPE': 'lead'
                        }
                    }, function (comment_res) {
                        if (comment_res.status === 200) {
                            if (comment_res.answer.result.length > 0) {
                                var tags = BX.findChildByClassName(cards[Number(comment_res.answer.result[0].ENTITY_ID)], 'crm-kanban-item-title', true);
                                var elem = BX.create('div', {
                                    attrs: {
                                        id: "circle",
                                        class: "circleComment",
                                        style: "width: 20px; height: 20px; -webkit-border-radius: 25px; -moz-border-radius: 25px; border-radius: 25px; background: #36e82a; float: right;",
                                    },
                                });
                                BX.insertAfter(elem, tags);
                            }
                        }
                    });
                }
            }

        }
    }
}

CustomLeadKanban.modKanbanLead = function (kanbanGrid) {
    let kanbanColumn = BX.findChildrenByClassName(kanbanGrid, 'main-kanban-column', true);
    let column = 0;
    if (kanbanColumn.length != 0) {
        for (let i = 0; i < kanbanColumn.length; i++) {
            if (column == 4) {
                column++;
            }
            let titleColumn = BX.findChildByClassName(kanbanColumn[i], 'main-kanban-column-title-text-inner', true);
            if (titleColumn.innerText == 'Принятые заказы') {
                kanbanColumn[i].style.order = 4;
            } else {
                kanbanColumn[i].style.order = column;
            }
            column++;
        }
    }
}
CustomLeadKanban.reloadedKanBanLead = function () {
    BX.addCustomEvent(
        'Kanban.Column:render',
        CustomLeadKanban.checkUrlKanBanEvents
    );
};

CustomLeadKanban.checkUrlKanBanEvents = async function (events) {
    if (document.URL.indexOf("/crm/lead/kanban/") != -1) {

        // console.log('prev conv ' + countConv);
        let kanbanColumn = BX.findChildrenByClassName(document, 'main-kanban-column-body', true);
        if (kanbanColumn.length > 0) {
            for (let itemCards in kanbanColumn) {
                if (kanbanColumn[itemCards].attributes["data-id"].value == events.id) {
                    var kanbanCards = BX.findChildrenByClassName(kanbanColumn[itemCards], 'main-kanban-item', true);
                    var cards = [];
                    if (countConv < kanbanCards.length) {
                        for (let n = countConv; n < kanbanCards.length; n++) {
                            cards[kanbanCards[n].attributes["data-id"].value] = kanbanCards[n];
                            var tagsCircle = BX.findChildByClassName(kanbanCards[n], 'circleComment', true);
                            var nameHref = BX.findChildByClassName(kanbanCards[n], 'crm-kanban-item-fields-item-value-name', true);
                            if (!tagsCircle) {
                                BX.rest.callMethod("crm.timeline.comment.list", {
                                    filter: {
                                        'ENTITY_ID': kanbanCards[n].attributes["data-id"].value,
                                        'ENTITY_TYPE': 'lead'
                                    }
                                }, function (comment_res) {
                                    if (comment_res.status === 200) {
                                        if (comment_res.answer.result.length > 0) {
                                            var tags = BX.findChildByClassName(cards[Number(comment_res.answer.result[0].ENTITY_ID)], 'crm-kanban-item-title', true);
                                            var elem = BX.create('div', {
                                                attrs: {
                                                    id: "circle",
                                                    class: "circleComment",
                                                    style: "width: 20px; height: 20px; -webkit-border-radius: 25px; -moz-border-radius: 25px; border-radius: 25px; background: #36e82a; float: right;",
                                                },
                                            });
                                            BX.insertAfter(elem, tags);
                                        }
                                    }
                                });
                            }
                        }
                    }
                    countConv = kanbanCards.length - 1;
                    // console.log('modify conv ' + countConv);
                    break;
                }
            }
        }

    }
}