"use strict";

/**
 * created by Tiago Moreira
 * 16-11-2016
 *
 * De forma a tornar a aplicação mais completa, aproveitei para adicionar algumas técnicas implementadas por mim noutros projectos.
 * Para além do que me foi pedido pela equipa da Thing Pink, adicionei um sistema de registo e login de utilizadores local. Após um
 * login válido, o utilizador poderá pesquisar tweets por uma ou mais hashtags e pode adicionala aos favoritos, que ficam gravados numa
 * base de dados indexada localmente.
 * A aplicação foi criada usando a framework de PHP Laravel 5.3, tendo já um conjunto de funcionalidades que permite o desenvolvimento local
 * mais simples. Alguma dúvida na instalação do mesmo ou para saber mais sobre a framework, podem consultar o seguinte link:
 * https://laravel.com/docs/5.3/installation
 *
 * Após ter o servidor a correr, basta aceder á página através do browser.
 * - Para começar, o utilizador tem de se registar. Na barra de navegação, clique em "Sign Up"
 * - Escolha um username e password (não há nenhuma validação a ser feita pelo formulário)
 * - Após o registo, é logo redireccionado para a página de login. Faça então o login com as credenciais anteriormente adicionadas.
 * - Após o login, pode fazer a persquisa de tweets acedendo ao link 'Search' na barra de navegação
 * - Insira as hastags que pretender e prima 'search'
 * - Uma lista irá ser apresentada. Cada search retorna no máximo 20 tweets de uma vez. Para ver tweets mais antigos, basta premir o botão 'more'
 *   no fim da lista
 * - Aqui pode também adicionar tweets aos favoritos. Para isso basta clicar em cima dos que pretende. Irá ver a 'estrelinha' a mudar para diferenciar os
 *   seus favoritos
 * - Para ver os tweets que já adicionou aos favoritos, basta clicar no link 'Favorits' na barra de navegação. Aqui pode também eliminar os tweets
 *   que já não pretende. Para isso basta clicar neles que os mesmos desaparecem.
 */

// Usando o sistema de rotas do ReactRouter
var { Router, Route, IndexRoute, Link, browserHistory, hashHistory } = ReactRouter;

// Criação da base de dados indexada
var db = $.idb({
    name:'thing-pink',
    version: 1,
    drop: [],
    stores: [{
        name: "favorits",
        keyPath: ["mkid", "user"],
        autoIncrement: false,
        index: ["text", "retweets", "favorites"],
        unique: [false, false]
    },
    {
        name: "users",
        keyPath: ["user", "password"],
        autoIncrement: false
    }]
});

var favorits = [];

// Definindo o corpo do layout base de toda a aplicação
var MainLayout = React.createClass({
    render: function() {
        return (
            <div className="container">
                <nav className="navbar navbar-default">
                    <div className="container-fluid">
                        <div className="navbar-header">
                            <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
                                <span className="sr-only">Toggle navigation</span>
                                <span className="icon-bar"></span>
                                <span className="icon-bar"></span>
                                <span className="icon-bar"></span>
                            </button>
                            <a className="navbar-brand" href="#">#TweetSearch</a>
                        </div>
                        <div id="navbar" className="navbar-collapse collapse">
                            <ul className="nav navbar-nav">
                                <NavLink to="/">Home</NavLink>
                                <NavLink to="login" dataWhen="logout">Login</NavLink>
                                <NavLink to="register" dataWhen="logout">Sign Up</NavLink>
                                <NavLink to="search" dataWhen="login">Search</NavLink>
                                <NavLink to="favorits" dataWhen="login">Favorits</NavLink>
                            </ul>
                            <ul className="nav navbar-nav pull-right">
                                <LogoutLink>Logout</LogoutLink>
                            </ul>
                        </div>
                    </div>
                </nav>
                <main>
                    {this.props.children}
                </main>
            </div>
        )
    }
})

// Criação do elemento que será replicado na barra de navegação
var NavLink = React.createClass({
    contextTypes: {
        router: React.PropTypes.object
    },
    onClick: function(e) {
        $("#navbar").collapse('toggle');
    },
    render: function() {
        let isActive = this.context.router.isActive(this.props.to, true),
            isLoggedIn = localStorage.getItem('currentUser') && localStorage.getItem('currentUser') !== "" ? true : false,
            active = isActive ? "active" : "",
            hidden = "";

        switch(this.props.dataWhen) {
            case 'login':
                hidden = isLoggedIn ? "" : "hidden";
                break;
            case 'logout':
                hidden = isLoggedIn ? "hidden" :  "";
                break;
            default:
                hidden = "";
                break;
        }

        return (
            <li onClick={this.onClick} className={active + " " + hidden}>
                <Link to={this.props.to}>
                    {this.props.children}
                </Link>
            </li>
        );
    }
});

// Criação do elemento que irá tormar conta do logout do utilizador
var LogoutLink = React.createClass({
    contextTypes: {
        router: React.PropTypes.object
    },
    onClick() {
        var r = confirm("Are you sure you want to logout?");
        if (r == true) {
            localStorage.setItem('currentUser', "");
            hashHistory.push("/");
        }
        return;
    },
    render: function() {
      let isLoggedIn = localStorage.getItem('currentUser') && localStorage.getItem('currentUser') !== "" ? true : false,
        hidden = isLoggedIn ? "" : "hidden";

      return (
          <li>
              <a href="#" className={hidden} onClick={this.onClick}>
                  {this.props.children}
              </a>
          </li>
      );
    }
});

// Criação da home page
var HomePage = React.createClass({
    contextTypes: {
        router: React.PropTypes.object
    },
    render: function() {
        return (
            <div className="container text-center">
                <h1>This is a test project to Thing Pink company.</h1>
            </div>
        );
    }
});

// Criação da página de pesquisa de tweets
var SearchLayout = React.createClass({
    getInitialState: function() {
        return {
            data: [],
            loading: false,
            searchWasMade: false,
            metadata: {}
        };
    },
    isLoadingActive: function() {
        return this.state.loading ? "show" : "hidden";
    },
    isMediaListActive: function() {
        return "row " + (this.state.loading ? "hidden" : "show");
    },
    handleSearchChange: function(e) {
        this.setState({search: e.target.value});
    },
    getFavClasses: function(obj) {
        var pos = favorits.map(function(row) { return row.mkid; }).indexOf(obj.mkid);
        return "glyphicon " + (pos < 0 ? "glyphicon-star-empty" : "glyphicon-star");
    },
    artistOnClick: function(i) {
        var _this = this;
        // só tomar qualquer ação quando se confirmar a existencia ou não de um tweet na lista de favoritos do utilizador
        favoriteExists(_this.state.data[i].id).then(function(flag) {
            if (flag) {
                $(".media .fav").eq(i).removeClass("glyphicon-star").addClass("glyphicon-star-empty");
                deleteFavorite(_this.state.data[i]);
            } else {
                $(".media .fav").eq(i).removeClass("glyphicon-star-empty").addClass("glyphicon-star");
                addFavorite(_this.state.data[i]);
            }
        });
    },
    loadResultsFromServer: function(e) {
        e.preventDefault();
        this.setState({
            loading: true,
            searchWasMade: true
        });

        $.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="_token"]').attr('content')
            }
        })

        var request_data = {
            search: this.state.search,
            metadata: $.isEmptyObject(this.state.metadata) ? "" : this.state.metadata,
            type: e.target.name
        };

        $.ajax({
            url: "/get-tweets",
            type: "POST",
            cache: false,
            dataType: "json",
            data: request_data,
            success: function(data) {
                this.setState({
                    loading: false,
                    metadata: data.search_metadata
                });

                if (data.statuses.length > 0) {
                    if (request_data.type == "search") {
                        this.setState({
                            data: data.statuses
                        });
                    } else {
                        this.setState({
                            data: this.state.data.concat(data.statuses)
                        });
                    }
                }
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("get-tweets", status, err.toString());
            }.bind(this)
        });
    },
    render: function() {
        var _this = this;
        var noResultsClasses = "";

        if (this.state.searchWasMade && !this.state.loading) {
            noResultsClasses = "text-center";
        } else {
            noResultsClasses = "text-center hidden";
        }

        return (
            <div className="search-layout">
                <div className="row text-center">
                    <svg viewBox="0 0 505 505" width="100" height="100">
                    	<circle id="circle" style={{ fill: "#FFD05B" }} cx="0" cy="0" r="252" transform="translate(250 250)" visibility="hidden">
                            <animateTransform
                                id="a1"
                                xlinkHref="#circle"
                                attributeName="transform"
                                attributeType="XML"
                                additive="sum"
                                type="scale"
                                from="0 0"
                                to="1 1"
                                dur="1s"
                                begin="0s"
                                fill="freeze"/>
                            <set attributeName="visibility" from="hidden" to="visible" begin="a1.begin"/>
                        </circle>

                        <g id="phone" visibility="hidden">
                    		<path style={{ fill: "#324A5E" }} d="M310.1,409.7H121.4c-1.8,0-3.3-1.5-3.3-3.3V98.6c0-1.8,1.5-3.3,3.3-3.3h188.8c1.8,0,3.3,1.5,3.3,3.3v307.8C313.5,408.2,312,409.7,310.1,409.7z"/>
                    		<rect x="131.7" y="134.5" style={{ fill: "#FFFFFF" }} width="168.1" height="228.7"/>
                    		<circle style={{ fill: "#E6E9EE" }} cx="215.7" cy="385.7" r="12.9"/>
                    		<g>
                    			<path style={{ fill: "#ACB3BA" }} d="M245,125.1h-58.5c-1,0-1.8-0.8-1.8-1.8l0,0c0-1,0.8-1.8,1.8-1.8h58.4c1,0,1.8,0.8,1.8,1.8l0,0C246.8,124.2,246,125.1,245,125.1z"/>
                    			<rect x="207.8" y="110.3" style={{ fill: "#ACB3BA" }} width="15.8" height="3.7"/>
                    		</g>

                            <animateTransform
                                id="a2"
                                xlinkHref="#phone"
                                attributeName="transform"
                                attributeType="XML"
                                type="rotate"
                                from="0 200 200"
                                to="360 200 200"
                                dur="1s"
                                begin="1s"
                                fill="freeze"/>
                            <set attributeName="visibility" from="hidden" to="visible" begin="a2.begin"/>
                    	</g>

                        <path id="baloon" style={{ fill: "#FF7058" }} d="M412.7,161.1H259.8c-9.6,0-17.4,7.8-17.4,17.4V275c0,9.6,7.8,17.4,17.4,17.4h8.7l-3.6,34.6l38.2-34.6h109.6c9.6,0,17.4-7.8,17.4-17.4v-96.5C430.1,168.9,422.3,161.1,412.7,161.1z" visibility="hidden">
                            <animateTransform
                                id="a3"
                                xlinkHref="#baloon"
                                attributeName="transform"
                                attributeType="XML"
                                additive="sum"
                                type="scale"
                                from="0 0"
                                to="1 1"
                                dur="1s"
                                begin="2s"
                                fill="freeze"/>
                            <set attributeName="visibility" from="hidden" to="visible" begin="a3.begin"/>
                        </path>
                    </svg>
                </div>
                <div className="row">
                    <form style={{ paddingTop: "20px" }} className="form-inline">
                        <div className="container-fluid text-center">
                            <div className="form-group">
                                <label className="sr-only" htmlFor="searchInput">Search</label>
                                <div className="input-group">
                                    <span className="input-group-addon" id="search">
                                        <span className="glyphicon glyphicon-search" aria-hidden="true"></span>
                                    </span>
                                    <input type="text" className="form-control" id="searchInput" placeholder="Search artist" aria-describedby="search" onChange={this.handleSearchChange}/>
                                </div>
                            </div>
                            <button type="submit" disabled={this.state.loading} name="search" onClick={this.loadResultsFromServer} className="btn btn-primary">Search</button>
                        </div>
                        <div className="container-fluid">
                            <div className="results-layout">
                                <div id="my-loader" className={this.isLoadingActive()}>
                                    <div className="loader">
                                        <div className="bounce1"></div>
                                        <div className="bounce2"></div>
                                        <div className="bounce3"></div>
                                    </div>
                                </div>
                                {(this.state.data.length > 0
                                    ?
                                    <div className={this.isMediaListActive()}>
                                        <div className="col-md-6 col-md-offset-3 col-xs-12">
                                            <ul className="media-list">
                                                {this.state.data.map(function(obj, i) {

                                                    return <TweetLayout
                                                        name={obj.text}
                                                        mkid={obj.id}
                                                        fav={obj.favorite_count}
                                                        retweet={obj.retweet_count}
                                                        key={i}
                                                        artistOnClick={_this.artistOnClick}
                                                        favClasses={_this.getFavClasses(obj)}
                                                        index={i}
                                                    />
                                                })}
                                            </ul>
                                        </div>
                                        <div className="col-md-6 col-md-offset-3 col-xs-12">
                                            <div className="more-button-container text-center">
                                                <button type="submit" onClick={_this.loadResultsFromServer} name="next" className="btn btn-default">more</button>
                                            </div>
                                        </div>
                                    </div>
                                    :
                                    <h2 className={noResultsClasses}>No results.</h2>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        )
    }
});

// Criação da página de favoritos
var FavoritsLayout = React.createClass({
    getInitialState: function() {
        return {
            data: favorits
        };
    },
    artistOnClick: function(i) {
        var _this = this;
        deleteFavorite(favorits[i]);
        this.setState({
            data: this.state.data.filter(function (e, idx) {
                return idx !== i;
            })
        });
    },
    render: function() {
      var _this = this;

      return (
        <div className="favorits-layout">
            <div className="row text-center">
                <svg viewBox="0 0 505 505" width="100" height="100" style={{ enableBackground: "new 0 0 504.124 504.124" }} xmlSpace="preserve">
                    <path id="path1" style={{ fill: "#B8D9F2" }} d="M228.431,41.309H31.508C14.178,41.309,0,55.487,0,72.816v133.908
                    	c0,17.329,14.178,31.508,31.508,31.508h3.938c4.332,0,19.692,1.969,23.631,6.302c11.815,9.452,3.151,3.938,19.692,17.329
                    	c-0.394-0.394,19.692,18.117,19.692,0v-23.631H228.43c17.329,0,31.508-14.178,31.508-31.508V72.816
                    	C259.938,55.487,245.76,41.309,228.431,41.309z" visibility="hidden">
                        <animateTransform
                            id="a1"
                            xlinkHref="#path1"
                            attributeName="transform"
                            attributeType="XML"
                            additive="sum"
                            type="scale"
                            from="0 0"
                            to="1 1"
                            dur="1s"
                            begin="0s"
                            fill="freeze"/>
                        <set attributeName="visibility" from="hidden" to="visible" begin="a1.begin"/>
                    </path>

                    <path id="path2" style={{ fill: "#55ACEE" }} d="M169.354,116.14h303.262c17.329,0,31.508,14.178,31.508,31.508v236.308
                    	c0,17.329-14.178,31.508-31.508,31.508H311.138c-4.332,0-19.692,1.969-23.631,6.302c-11.815,9.452-26.782,19.692-43.323,33.083
                    	c0.394-0.394-19.692,18.117-19.692,0v-39.385h-55.138c-17.329,0-31.508-14.178-31.508-31.508V147.647
                    	C137.846,130.318,152.025,116.14,169.354,116.14z" visibility="hidden">
                        <animateTransform
                            id="a2"
                            xlinkHref="#path2"
                            attributeName="transform"
                            attributeType="XML"
                            additive="sum"
                            type="scale"
                            from="0 0"
                            to="1 1"
                            dur="1s"
                            begin="1s"
                            fill="freeze"/>
                        <set attributeName="visibility" from="hidden" to="visible" begin="a2.begin"/>
                    </path>

                    <path id="path3" style={{ fill: "#FFFFFF" }} d="M409.6,214.207c-6.302,2.757-13.391,4.332-20.48,5.12c7.483-3.938,12.997-10.634,15.754-18.117
                    	c-6.695,3.938-14.572,6.302-22.449,7.877c-6.302-6.302-15.754-10.24-25.994-10.24c-19.692,0-35.446,14.572-35.446,32.689
                    	c0,2.757,0.394,5.12,0.788,7.483c-29.538-1.182-55.926-14.572-73.255-34.265c-3.151,4.726-4.726,10.634-4.726,16.542
                    	c0,11.422,6.302,21.268,15.754,27.175c-5.908,0-11.422-1.575-16.148-3.938v0.394c0,15.754,12.209,29.145,28.357,32.295
                    	c-3.151,0.788-6.302,1.182-9.452,1.182c-2.363,0-4.332-0.394-6.695-0.788c4.332,12.997,17.723,22.449,33.083,22.843
                    	c-12.209,8.665-27.569,14.178-44.111,14.178c-2.757,0-5.514,0-8.665-0.394c15.754,9.452,34.265,14.572,54.351,14.572
                    	c65.378,0,101.218-50.018,101.218-93.342v-4.332C398.966,226.416,404.874,220.903,409.6,214.207z" visibility="hidden">
                        <animateTransform
                            id="a3"
                            xlinkHref="#path3"
                            attributeName="transform"
                            attributeType="XML"
                            type="rotate"
                            from="0 200 200"
                            to="360 200 200"
                            dur="1s"
                            begin="2s"
                            fill="freeze"/>
                        <set attributeName="visibility" from="hidden" to="visible" begin="a3.begin"/>
                    </path>
                </svg>
            </div>
            <div className="row">
                <div className="results-layout">
                    <div className="container-fluid">
                        {(this.state.data.length > 0
                            ?
                            <div className="row">
                                <div className="col-md-6 col-md-offset-3 col-xs-12">
                                    <ul className="media-list">
                                        {this.state.data.map(function(obj, i) {
                                            var className = "glyphicon glyphicon-star";

                                            return <TweetLayout
                                                name={obj.name}
                                                mkid={obj.mkid}
                                                fav={obj.favorites}
                                                retweet={obj.retweets}
                                                key={i}
                                                artistOnClick={_this.artistOnClick}
                                                favClasses={className}
                                                index={i}
                                            />
                                        })}
                                    </ul>
                                </div>
                            </div>
                            :
                            <h2 className="text-center">There is no favorits to present.</h2>
                        )}
                    </div>
                </div>
            </div>
        </div>
      )
    }
});

// Criação do elemento onde vai estar presente a informação do tweet
var TweetLayout = React.createClass({
    contextTypes: {
        router: React.PropTypes.object
    },
    onClick: function(i) {
        this.props.artistOnClick(i);
    },
    handleFavClasses: function() {
        return "fav " + this.props.favClasses;
    },
    render: function() {
        let name = this.props.name,
            mkid = this.props.id,
            index = this.props.index,
            fav = this.props.fav,
            rt = this.props.retweet;

        return (
            <li className="media artist" data-mkid={mkid} data-index={index} style={{ cursor: "pointer" }} onClick={this.onClick.bind(this, index)}>
                <div style={{ position: 'relative' }} className="media-body">
                    <div className="row">
                        <div className="col-xs-11">
                            <div className="row">
                                <div className="col-xs-12">
                                    <h4 className="media-heading">{name}</h4>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-xs-6">
                                    <span className="glyphicon glyphicon-heart"></span> {fav}
                                </div>
                                <div className="col-xs-6">
                                    <span className="glyphicon glyphicon-retweet"></span> {rt}
                                </div>
                            </div>
                        </div>
                        <div className="col-xs-1">
                            <span className={this.handleFavClasses()}></span>
                        </div>
                    </div>
                </div>
            </li>
        );
    }
});

// Criação do corpo para as páginas de login e registo
var AuthLayout = React.createClass({
    render: function() {
        return (
            <div className="auth">
                <header className="auth-header"></header>
                <div className="results">
                {this.props.children}
                </div>
            </div>
        )
    }
})

// Criação do form de login
var LoginForm = React.createClass({
    ValidateLogin: function() {
        var user = this.refs.LoginUser.state.value;
        var password = this.refs.LoginPassword.state.value;
        Login(user, password).then(function(status) {
            if (status == "failed") {
                $(".bg-danger").toggleClass("invisible", false);
            }
        });
    },
    render() {
        return (
            <form className="form-signin">
                <p className="bg-danger invisible" style={{ padding: "10px" }}>Login has faild! Please try again.</p>
                <h2 className="form-signin-heading">Please sign in</h2>
                <UserField ref="LoginUser"/>
                <PasswordField ref="LoginPassword"/>
                <SignIn ValidateLogin={this.ValidateLogin}/>
                <a className="btn btn-lg btn-default btn-block" href="#/register">Sign up</a>
            </form>
        )
    }
});

// Criação do form de registo
var RegisterForm = React.createClass({
    ValidateRegister: function() {
        var user = this.refs.LoginUser.state.value;
        var password = this.refs.LoginPassword.state.value;
        Register(user, password);
    },
    render() {
        return (
            <form className="form-signin">
                <h2 className="form-signin-heading">Please sign up</h2>
                <UserField ref="LoginUser"/>
                <PasswordField ref="LoginPassword"/>
                <SignUp ValidateRegister={this.ValidateRegister}/>
            </form>
        )
    }
});

// Criação do campo do form que representa o username
var UserField = React.createClass({
    getInitialState() {
        return {value: null}
    },
    onChange(e) {
        this.setState({value: e.target.value});
    },
    render() {
        return (
            <div className="LoginUserDiv">
                <label htmlFor="inputUser" className="sr-only">Username</label>
                <input type="text" id="inputUser" className="form-control" placeholder="Username" required="" onChange={this.onChange}/>
            </div>
        )
    }
});

// Criação do campo do form que representa a password
var PasswordField = React.createClass({
    getInitialState() {
        return {value: null}
    },
    onChange(e) {
        this.setState({value: e.target.value});
    },
    render() {
        return (
            <div className="LoginPasswordDiv">
                <label htmlFor="inputPassword" className="sr-only">Password</label>
                <input type="password" id="inputPassword" className="form-control" placeholder="Password" required="" onChange={this.onChange}/>
            </div>
        )
    }
});

// Criação do botão do form que vai submter o login
var SignIn = React.createClass({
    onClick() {
        this.props.ValidateLogin();
    },
    render() {
        return (
            <button className="btn btn-lg btn-primary btn-block" onClick={this.onClick}>Sign in</button>
        )
    }
});

// Criação do botão do form que vai submter o registo
var SignUp = React.createClass({
    onClick() {
        this.props.ValidateRegister();
    },
    render() {
        return (
            <a className="btn btn-lg btn-default btn-block" onClick={this.onClick}>Sign up</a>
        )
    }
});

// Método que vai consultar á base de dados se o login efectuado é válido ou não
function Login(user, password) {
    var deferred = $.Deferred();

    db.select("users", function([u, p], value) {
        return (u == user && p == password);
    }).done(function(items) {
        if (items.length > 0) {
            localStorage.setItem('currentUser', user);
            getFavorits().then(function(items) {
                deferred.resolve("success");
                favorits = items;
                hashHistory.push("/");
            });
        } else {
            deferred.resolve("failed");
        }
    });

    return deferred.promise();
};

// Método que vai guardar na base de dados os dados do registo do utilizador
function Register(user, password) {
    var data = {
        "user": user,
        "password": password,
    };

    db.put(data, "users").done(function() {
        hashHistory.push("/login");
    });
};

// Método que vai à base de dados buscar a lista de todos os tweets favoritos de um determinado utilizador
function getFavorits() {
    var user = localStorage.getItem('currentUser');

    var deferred = $.Deferred();

    db.select("favorits", function([m, u], value) {
        return u == user;
    }).done(function(items) {
        deferred.resolve(items);
    });

    return deferred.promise();
};

// Método que vai à base de dados buscar verificar se um determinado tweet já foi adicionado ou não aos favoritos
function favoriteExists(mkid) {
    var user = localStorage.getItem('currentUser');
    var deferred = $.Deferred();

    db.select("favorits", function([m, u], value) {
        return (m == mkid && u == user);
    }).done(function(items) {
        deferred.resolve(items.length > 0);
    });

    return deferred.promise();
};

// Método que vai guardar na base de dados um determinado tweet na lista de favoritos
function addFavorite(props) {
    var user = localStorage.getItem('currentUser');
    var data = {
        "mkid": props.id,
        "user": user,
        "name": props.text,
        "retweets": props.retweet_count,
        "favorites": props.favorite_count,
    };
    console.log(data);
    db.put(data, 'favorits').done(function() {
        console.log()
        favorits[data.mkid] = data;
    });
};

// Método que vai apagar da base de dados um determinado tweet da lista de favoritos
function deleteFavorite(props) {
    var user = localStorage.getItem('currentUser');

    db.remove('favorits', function([m, u], value) {
        return (m == props.mkid && u == user);
    }).done();
};

// Esta parte garante que a lista de favoritos é carregada para memória antes de qualquer conteúdo ser apresentado na página
getFavorits().then(function(items) {
    favorits = items;

    // Trata de renderizar na página todos os elementos definidos anteriormente, definindo as respetivas rotas para cada página existente
    ReactDOM.render((
        <Router history={hashHistory}>
            <Route path="/" component={MainLayout}>
                <IndexRoute component={HomePage} />
                <Route component={AuthLayout}>
                    <Route path="/login" component={LoginForm} />
                    <Route path="/register" component={RegisterForm} />
                </Route>
                <Route>
                    <Route path="/search" component={SearchLayout} />
                    <Route path="/favorits" component={FavoritsLayout} />
                </Route>
            </Route>
        </Router>
    ), document.getElementById('root'));
});
