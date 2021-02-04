import { Component, OnInit } from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import { UserService } from '../../services/user.service';
import { CategoryService } from '../../services/category.service';
import { PostService } from '../../services/post.service';
import { Post } from '../../models/post';
import { global } from '../../services/global';

@Component({
  selector: 'app-post-edit',
  templateUrl: '../post-new/post-new.component.html',
  providers: [UserService, CategoryService,PostService]
})
export class PostEditComponent implements OnInit {

  public page_title: string;
  public identity;
  public token;
  public post: Post;
  public categories;
  public status;
  public resetVar;
  public is_edit:boolean;
  public url:string;

  public afuConfig = {
    multiple: false,
    formatsAllowed: ".jpg, .png, .gif",
    maxSize: "50",
    uploadAPI:  {
      url:global.url+'post/upload',
      method:"POST",
      headers: {
     "Authorization" : this._userService.getToken()
      },
      params: {
        'page': '1'
      },
      responseType: 'blob',
    },
    theme: "attachPin",
    hideProgressBar: false,
    hideResetBtn: true,
    hideSelectBtn: false,
    attachPinText: 'Sube tu avatar de usuario',
  };

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _userService: UserService,
    private _categoryService: CategoryService,
    private _postService: PostService

  ) {
    this.page_title = 'Editar una entrada';
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();
    this.is_edit = true;
    this.url = global.url;

   }

  ngOnInit(): void {
    this.getCategories();
    this.post = new Post(1,this.identity.sub,1,'','',null,null);
    this.getPost();
  }

  getCategories(){
    this._categoryService.getCategories().subscribe(
      response => {
        if(response.status == 'success'){
          this.categories = response.categories;
          console.log(this.categories);
        }
      },
      error => {
        console.log(error);
      }
    );
  }
  getPost(){
    //Sacar el id del post de la url
    this._route.params.subscribe(params =>{
      let id = +params['id'];
      //Peticion Ajax para sacar los datos
      this._postService.getPost(id).subscribe(
        response => {
          if(response.status == 'success')
          {
            this.post = response.post;
            if(this.post.user_id != this.identity.sub){
              this._router.navigate(['/inicio']);
            }
          }else{
            this._router.navigate(['inicio']);
          }
        },
        error => {
          console.log(error);
          this._router.navigate(['inicio']);
        }
      );
    });
  }
  imageUpload(datos){
    let image_data = JSON.parse(datos.response);
    this.post.image = image_data.image;
  }

  onSubmit(form){
    this._postService.update(this.token, this.post, this.post.id).subscribe(
      response => {
        if(response.status = 'success'){
          this.status = 'success';
          //this.post = response.post;
          //redirigir a la pagina de post
          this._router.navigate(['/entrada', this.post.id]);
        }else
        {
          this.status = 'error';
        }
      },
      error => {
        this.status = 'error';
      }
    )
  }

}
