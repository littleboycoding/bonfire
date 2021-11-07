package handler

type Asset struct {
	Name     string `json:"name"`
	Mimetype string `json:"mimetype"`
}

type Object struct {
	Name string `json:"name"`
}

type Scene struct {
	Name string `json:"name"`
}
