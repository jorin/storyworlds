import RenderService from 'services/render_service';
import Detail from 'components/characters/detail';

document.addEventListener('DOMContentLoaded', () => {
  RenderService.render('character', Detail);
});
