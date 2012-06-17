// ==UserScript==
// @name            Déplacement plus rapide
// @require         http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js
// @include         <YOUR VBulletin domaine here>/forums/inlinemod.php*
// ==/UserScript==



jQuery(function(){
  if ($('select[name=destforumid]').length == 0) { return };
  
  // Variante insensible à la casse de la pseudo propriété :contains
  $.extend($.expr[':'], {
    containsi: function (elem, i, match, array) {
      return (elem.textContent || elem.innerText || '').toLowerCase().indexOf((match[3] || '').toLowerCase()) >= 0;
    }
  });
  
  
  // Pour gecko, enlever les espaces insécables pour rendre la liste accessibles au clavier
  // Difficile de personnaliser l'apprence des selects sur webkit
  
  var tree = []
  $('select[name=destforumid] option').each(function(){
    // niveau
    var level =  parseInt(
      $(this).attr('class').substring(
        6
      )    
    )
    
    // Les balises option ont déjà le niveau de profondeur en class
    // Mieux vaut remplacer cette partie par CSS
    if ($.browser.mozilla) {
      $(this).text($(this).text().trim())
      $(this).css(
        'text-indent', 
        level * 15
      )
    };
    

    // enregistrement des titres des forums/catégories parents pour plus de lisibilité
    var ancesters = ""
    tree[level] = $(this).text()
    
    for (var i = level - 1; i >= 0; i--){
      ancesters += ' « ' + tree[i]
    };
    
    $(this).data('ancesters', ancesters)
  })
  
  
  // ajout d'autres balises pour la recherche et l'autocomplétion
  // Valeur par défaut en HTML5, facilement reproductible pour les anciens navigateurs
  $('select[name=destforumid]').before('\
    <div>\
      <input type="text" id="autocomplete" placeholder="Recherche rapide..." />\
    </div>\
    <div id="autocomplete-choices">\
    </div>\
  ');
  
  // Ajout d'un évènement au clic pour tous les liens qui vont être générés
  $('#autocomplete-choices ul a').live('click', function(e){
    $('select[name=destforumid]').val(
      $(this).attr('href')
    )
    
    e.preventDefault()
  })
  
  $('#autocomplete').keyup(function(){
    // Pas d'autocomplétion au dessous de 2 caractères
    if ($(this).val().length < 2) { return false };
    
    var keywords = $(this).val();
    var nodes = $("select[name=destforumid] option:containsi('" + $(this).val() + "')")
    

    if (nodes.length > 0) {
      // En CSS ça sera mieux là aussi
      $('#autocomplete-choices').html('<ul style="margin: 0; margin-top: 5px; padding: 0; list-style: none"></ul>')    
      

      nodes.each(function(){
        // Inutile d'afficher les forums-liens
        if ($(this).text().indexOf('(Lien)') < 1) {
          
          var klass = parseInt($(this).attr('class').substring(6));
          
          var parent = ""
          
          if (klass > 0) {
            parent = ' <span style="color: grey">(' + $(this).data('ancesters') + ' )</span>'
          };
          
          // ajout des liens de selection des forums correspondant aux mots clés
          $('#autocomplete-choices ul').append(
            '<li>' +
              '<a style="color: black; text-decoration: none;" href="'+
                $(this).attr('value') +
              '">' +
                $(this).text().replace(
                  new RegExp("("+keywords+")", 'i'),
                   "<strong style='border-bottom: 1px dotted black'>$1</strong>"
                ) +
                parent +
              '</a>' +
            '</li>'
          )
        };
      })
    } else {
      $('#autocomplete-choices').html('Aucun forum trouvé <img src="http://www.developpez.net/forums/images/smilies/aie.gif" alt="aie" /> ')
    };
  })
})

