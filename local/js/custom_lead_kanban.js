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
            if (kanbanColumn[itemCards].attributes["data-id"].value == 'CONVERTED' ||
                kanbanColumn[itemCards].attributes["data-id"].value == 'PROCESSED' ||
                kanbanColumn[itemCards].attributes["data-id"].value == 'IN_PROCESS') {
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
                                    for (let f in comment_res.answer.result) {
                                        var nameHref = BX.findChildByClassName(cards[Number(comment_res.answer.result[f].ENTITY_ID)], 'crm-kanban-item-fields-item-value-name', true);
                                        var userID = parseInt(nameHref.href.slice(-10).match(/\d+/));
                                        if (comment_res.answer.result[f].AUTHOR_ID != userID) {
                                            var tags = BX.findChildByClassName(cards[Number(comment_res.answer.result[f].ENTITY_ID)], 'crm-kanban-item-title', true);
                                            var elem = BX.create('div', {
                                                attrs: {
                                                    id: "circle",
                                                    class: "circleComment",
                                                    style: "width: 20px; height: 20px; -webkit-border-radius: 25px; -moz-border-radius: 25px; border-radius: 25px; background: #36e82a; float: right;",
                                                },
                                            });
                                            BX.insertAfter(elem, tags);
                                            break;
                                        }
                                    }
                                }
                            }
                        });
                        // var comment_res = await BX.rest.callMethod("crm.timeline.comment.list",
                        //     {
                        //         filter: {
                        //             'ENTITY_ID': kanbanCards[cardIndex].attributes["data-id"].value,
                        //             'ENTITY_TYPE': 'lead'
                        //         }
                        //     });
                    }
                }
            }
        }
    }
// if (kanbanCards) {
//     for (var cardIndex in kanbanCards) {
//         cards[kanbanCards[cardIndex].attributes["data-id"].value] = kanbanCards[cardIndex];
//         var lead_res = await BX.rest.callMethod("crm.lead.get", {id: kanbanCards[cardIndex].attributes["data-id"].value});
//         if(lead_res.status == 200){
//
//         }
// BX.rest.callMethod("crm.lead.get", {id: kanbanCards[cardIndex].attributes["data-id"].value}, function (result) {
//     if(result.status == 200){
//         if (result.answer.result.STATUS_ID == 'IN_PROCESS' || result.answer.result.STATUS_ID == 'PROCESSED' || result.answer.result.STATUS_ID == 'CONVERTED') {
//             BX.rest.callMethod("crm.timeline.comment.list", {filter: {'ENTITY_ID': result.answer.result.ID, 'ENTITY_TYPE': 'lead'}}, function (resultCom) {
//                 if(resultCom.status == 200){
//                     for(let i in resultCom.answer.result){
//                         if(resultCom.answer.result[i].AUTHOR_ID != result.answer.result.ASSIGNED_BY_ID){
//                             var tags = BX.findChildByClassName(cards[Number(resultCom.answer.result[i].ENTITY_ID)], 'crm-kanban-item-title', true);
//                             var elem = BX.create('div', {
//                                 attrs: {
//                                     id: "circle",
//                                     style: "width: 15px; height: 15px; -webkit-border-radius: 25px; -moz-border-radius: 25px; border-radius: 25px; background: red; float: right;",
//                                 },
//                             });
//                             BX.insertAfter(elem, tags);
//                             break;
//                         }
//                     }
//                 }
//             });
//         }
//     }
// });
//     }
// }
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
        if (events.id == 'CONVERTED') {
            // console.log('prev conv ' + countConv);
            let kanbanColumn = BX.findChildrenByClassName(document, 'main-kanban-column-body', true);
            if (kanbanColumn.length > 0) {
                for (let itemCards in kanbanColumn) {
                    if (kanbanColumn[itemCards].attributes["data-id"].value == 'CONVERTED') {
                        var kanbanCards = BX.findChildrenByClassName(kanbanColumn[itemCards], 'main-kanban-item', true);
                        var cards = [];
                        if (countConv < kanbanCards.length) {
                            for (let n = countConv; n < kanbanCards.length; n++) {
                                cards[kanbanCards[n].attributes["data-id"].value] = kanbanCards[n];
                                var tagsCircle = BX.findChildByClassName(kanbanCards[n], 'circleComment', true);
                                var nameHref = BX.findChildByClassName(kanbanCards[n], 'crm-kanban-item-fields-item-value-name', true);
                                var userID = parseInt(nameHref.href.slice(-10).match(/\d+/));
                                if (!tagsCircle) {
                                    BX.rest.callMethod("crm.timeline.comment.list", {
                                        filter: {
                                            'ENTITY_ID': kanbanCards[n].attributes["data-id"].value,
                                            'ENTITY_TYPE': 'lead'
                                        }
                                    }, function (comment_res) {
                                        if (comment_res.status === 200) {
                                            if (comment_res.answer.result.length > 0) {
                                                for (let f in comment_res.answer.result) {
                                                    var nameHref = BX.findChildByClassName(cards[Number(comment_res.answer.result[f].ENTITY_ID)], 'crm-kanban-item-fields-item-value-name', true);
                                                    var userID = parseInt(nameHref.href.slice(-10).match(/\d+/));
                                                    if (comment_res.answer.result[f].AUTHOR_ID != userID) {
                                                        var tags = BX.findChildByClassName(cards[Number(comment_res.answer.result[f].ENTITY_ID)], 'crm-kanban-item-title', true);
                                                        var elem = BX.create('div', {
                                                            attrs: {
                                                                id: "circle",
                                                                class: "circleComment",
                                                                style: "width: 20px; height: 20px; -webkit-border-radius: 25px; -moz-border-radius: 25px; border-radius: 25px; background: #36e82a; float: right;",
                                                            },
                                                        });
                                                        BX.insertAfter(elem, tags);
                                                        break;
                                                    }
                                                }
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
        if (events.id == 'PROCESSED') {
            // console.log('prev process ' + countProgress);
            let kanbanColumn = BX.findChildrenByClassName(document, 'main-kanban-column-body', true);
            if (kanbanColumn.length > 0) {
                for (let itemCards in kanbanColumn) {
                    if (kanbanColumn[itemCards].attributes["data-id"].value == 'PROCESSED') {
                        var kanbanCards = BX.findChildrenByClassName(kanbanColumn[itemCards], 'main-kanban-item', true);
                        var cards = [];
                        if (countProgress < kanbanCards.length) {
                            for (let n = countProgress; n < kanbanCards.length; n++) {
                                cards[kanbanCards[n].attributes["data-id"].value] = kanbanCards[n];
                                var tagsCircle = BX.findChildByClassName(kanbanCards[n], 'circleComment', true);
                                var nameHref = BX.findChildByClassName(kanbanCards[n], 'crm-kanban-item-fields-item-value-name', true);
                                var userID = parseInt(nameHref.href.slice(-10).match(/\d+/));
                                if (!tagsCircle) {
                                    BX.rest.callMethod("crm.timeline.comment.list", {
                                        filter: {
                                            'ENTITY_ID': kanbanCards[n].attributes["data-id"].value,
                                            'ENTITY_TYPE': 'lead'
                                        }
                                    }, function (comment_res) {
                                        if (comment_res.status === 200) {
                                            if (comment_res.answer.result.length > 0) {
                                                for (let f in comment_res.answer.result) {
                                                    var nameHref = BX.findChildByClassName(cards[Number(comment_res.answer.result[f].ENTITY_ID)], 'crm-kanban-item-fields-item-value-name', true);
                                                    var userID = parseInt(nameHref.href.slice(-10).match(/\d+/));
                                                    if (comment_res.answer.result[f].AUTHOR_ID != userID) {
                                                        var tags = BX.findChildByClassName(cards[Number(comment_res.answer.result[f].ENTITY_ID)], 'crm-kanban-item-title', true);
                                                        var elem = BX.create('div', {
                                                            attrs: {
                                                                id: "circle",
                                                                class: "circleComment",
                                                                style: "width: 20px; height: 20px; -webkit-border-radius: 25px; -moz-border-radius: 25px; border-radius: 25px; background: #36e82a; float: right;",
                                                            },
                                                        });
                                                        BX.insertAfter(elem, tags);
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                    });
                                }
                            }
                        }
                        countProgress = kanbanCards.length - 1;
                        // console.log('modify process ' + countProgress);
                        break;
                    }
                }
            }
        }
        if (events.id == 'IN_PROCESS') {
            // console.log('prev in_process ' + countInProcess);
            let kanbanColumn = BX.findChildrenByClassName(document, 'main-kanban-column-body', true);
            if (kanbanColumn.length > 0) {
                for (let itemCards in kanbanColumn) {
                    if (kanbanColumn[itemCards].attributes["data-id"].value == 'IN_PROCESS') {
                        var kanbanCards = BX.findChildrenByClassName(kanbanColumn[itemCards], 'main-kanban-item', true);
                        var cards = [];
                        if (countInProcess < kanbanCards.length) {
                            for (let n = countInProcess; n < kanbanCards.length; n++) {
                                cards[kanbanCards[n].attributes["data-id"].value] = kanbanCards[n];
                                var tagsCircle = BX.findChildByClassName(kanbanCards[n], 'circleComment', true);
                                var nameHref = BX.findChildByClassName(kanbanCards[n], 'crm-kanban-item-fields-item-value-name', true);
                                var userID = parseInt(nameHref.href.slice(-10).match(/\d+/));
                                if (!tagsCircle) {
                                    BX.rest.callMethod("crm.timeline.comment.list", {
                                        filter: {
                                            'ENTITY_ID': kanbanCards[n].attributes["data-id"].value,
                                            'ENTITY_TYPE': 'lead'
                                        }
                                    }, function (comment_res) {
                                        if (comment_res.status === 200) {
                                            if (comment_res.answer.result.length > 0) {
                                                for (let f in comment_res.answer.result) {
                                                    var nameHref = BX.findChildByClassName(cards[Number(comment_res.answer.result[f].ENTITY_ID)], 'crm-kanban-item-fields-item-value-name', true);
                                                    var userID = parseInt(nameHref.href.slice(-10).match(/\d+/));
                                                    if (comment_res.answer.result[f].AUTHOR_ID != userID) {
                                                        var tags = BX.findChildByClassName(cards[Number(comment_res.answer.result[f].ENTITY_ID)], 'crm-kanban-item-title', true);
                                                        var elem = BX.create('div', {
                                                            attrs: {
                                                                id: "circle",
                                                                class: "circleComment",
                                                                style: "width: 20px; height: 20px; -webkit-border-radius: 25px; -moz-border-radius: 25px; border-radius: 25px; background: #36e82a; float: right;",
                                                            },
                                                        });
                                                        BX.insertAfter(elem, tags);
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                    });
                                }
                            }
                        }
                        countInProcess = kanbanCards.length - 1;
                        // console.log('modify in_process ' + countInProcess);
                        break;
                    }
                }
            }
        }
    }
}