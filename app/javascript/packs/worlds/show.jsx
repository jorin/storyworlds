import RenderService from 'services/render_service';
import Detail from 'components/worlds/detail';

document.addEventListener('DOMContentLoaded', () => {
  RenderService.render('world', Detail);
});
